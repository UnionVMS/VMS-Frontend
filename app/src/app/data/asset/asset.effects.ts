import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTER_NAVIGATED, RouterNavigationAction } from '@ngrx/router-store';
import { Store, Action } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, merge, Observable, interval, Subject, forkJoin } from 'rxjs';
import {
  map, mergeMap, mergeAll, catchError, withLatestFrom, bufferTime, filter, takeUntil, take, skipWhile
} from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { AuthSelectors } from '../auth';
import { MapSettingsSelectors } from '../map-settings';

import { AssetService } from './asset.service';
import { AssetSelectors, AssetTypes, AssetActions } from './';
import { IncidentActions } from '@data/incident';
import { ActivityActions, ActivityTypes } from '@data/activity';
import * as MapActions from '@data/map/map.actions';
import * as RouterSelectors from '@data/router/router.selectors';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import { MobileTerminalActions } from '@data/mobile-terminal';

import { replacePlaceholdersInTranslation } from '@app/helpers/helpers';
import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class AssetEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly assetService: AssetService,
    private readonly store: Store<State>,
    private readonly router: Router
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  assetSearchObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.searchAssets),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, action.searchQuery, action.includeInactivated).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any) => {
          return AssetActions.setAssetList({
            searchQuery: action.searchQuery,
            assets: response.assetList.reduce((acc, asset) => {
              acc[asset.historyId] = asset;
              return acc;
            }, {}),
            userSearch: action.userSearch === true,
            includeInactivated: action.includeInactivated
          });
        })
      );
    })
  ));

  getNumberOfVMSAssetsInSystemObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getNumberOfVMSAssetsInSystem),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      const searchQuery: AssetTypes.AssetListSearchQuery = {
        fields: [
          {
            searchField: 'mobileTerminals',
            searchValue: 'true',
          },
          {
            searchField: 'vesselType',
            searchValue: 'fishing'
          },
        ],
        logicalAnd: true,
      };
      return this.assetService.countAssets(authToken, searchQuery).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any) => {
          return AssetActions.setNumberOfVMSAssetsInSystem({
            numberOfVMSAssetsInSystem: response
          });
        })
      );
    })
  ));

  assetMovementUnsubscribeObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.unsubscribeToMovements),
    mergeMap((action) => {
      this.assetService.unsubscribeToMovements();
      return of(MapActions.setReady({ ready: false }));
    })
  ));

  private readonly removeOldAssetsIntervalDone$: Subject<boolean> = new Subject<boolean>();

  // Every 10 minutes
  removeOldAssetsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ROUTER_NAVIGATED),
    mergeMap((action: RouterNavigationAction) => {
      if(action.payload.routerState.url === '/map/realtime') {
        this.removeOldAssetsIntervalDone$.next(false);
        return interval(600000).pipe(
          takeUntil(this.removeOldAssetsIntervalDone$),
          withLatestFrom(this.store.select(AssetSelectors.selectAssetMovements)),
          mergeMap((
            [ intervalCount, assetMovements ]: [number, { [uid: string]: AssetTypes.AssetMovement; }]
          ): Observable<Action> => {
            const oneHour = 1000 * 60 * 60;
            const positionsToRemoveOrUpdate = Object.values(assetMovements).reduce(
              (acc, assetMovement, index) => {
                const date = new Date(assetMovement.movement.timestamp);
                const timeBetweenNowAndThen = Date.now() - date.getTime();
                if((timeBetweenNowAndThen > oneHour * 9)) {
                  acc.assetsToDelete.push(assetMovement.asset);
                } else if((timeBetweenNowAndThen > oneHour * 8)) {
                  if(timeBetweenNowAndThen > oneHour * 8.75) {
                    acc.decayingAssets[assetMovement.asset] = { ...assetMovement, decayPercentage: 0.25 };
                  } else if(timeBetweenNowAndThen > oneHour * 8.5) {
                    acc.decayingAssets[assetMovement.asset] = { ...assetMovement, decayPercentage: 0.5 };
                  } else {
                    acc.decayingAssets[assetMovement.asset] = { ...assetMovement, decayPercentage: 0.75 };
                  }
                }
                return acc;
              }, { assetsToDelete: [], decayingAssets: {} }
            );
            if(positionsToRemoveOrUpdate.assetsToDelete.length > 0 && Object.keys(positionsToRemoveOrUpdate.decayingAssets).length > 0) {
              return of(
                AssetActions.removeAssets({ assetIds: positionsToRemoveOrUpdate.assetsToDelete }),
                AssetActions.updateDecayOnAssetPosition({ assetMovements: positionsToRemoveOrUpdate.decayingAssets })
              );
            }
            if(positionsToRemoveOrUpdate.assetsToDelete.length > 0) {
              return of(AssetActions.removeAssets({ assetIds: positionsToRemoveOrUpdate.assetsToDelete }));
            }
            if(Object.keys(positionsToRemoveOrUpdate.decayingAssets).length > 0) {
              return of(AssetActions.updateDecayOnAssetPosition({ assetMovements: positionsToRemoveOrUpdate.decayingAssets }));
            }
            return EMPTY;
          })
        );
      } else {
        this.removeOldAssetsIntervalDone$.next(true);
        return EMPTY;
      }
    })
  ));

  assetMovementSubscribeObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.subscribeToMovements),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return merge(
        this.assetService.getInitalAssetMovements(authToken).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((response: {
            assetList: ReadonlyArray<AssetTypes.Asset>,
            movements: ReadonlyArray<AssetTypes.Movement>
          }) => {
            return new Observable((observer) => {
              observer.next(
                AssetActions.assetsMoved({
                  assetMovements: response.movements.reduce((acc, movement) => {
                    if(typeof movement.speed === 'undefined') {
                      acc[movement.asset] = { movement: { ...movement, speed: null }, asset: movement.asset };
                    } else {
                      acc[movement.asset] = { movement, asset: movement.asset };
                    }

                    return acc;
                  }, {})
                })
              );
              observer.next(
                AssetActions.setAssets({
                  assets: response.assetList.reduce((acc, asset) => {
                    acc[asset.id] = asset;
                    return acc;
                  }, {})
                })
              );
              observer.next(MapActions.setReady({ ready: true }));
              observer.complete();
            });
          }),
          mergeAll()
        ),
        this.assetService.mapSubscription(authToken).pipe(
          bufferTime(1000),
          withLatestFrom(
            this.store.select(AssetSelectors.getAssets),
            this.store.select(AuthSelectors.hasActivityFeature)),
          // We need to add any at the end because the buffer is types as Unknown[], we know it to be the first data
          // structure defined but that does not help apparenlty
          mergeMap(([messages, assets, hasActivityFeature]: Array<
            Array<{ type: string, data: any }> | { readonly [uid: string]: AssetTypes.Asset } | any
          >) => {
            if(messages.length !== 0) {
              const messagesByType = messages.reduce((messagesByTypeAcc, message) => {
                if(typeof messagesByTypeAcc[message.type] === 'undefined') {
                  messagesByTypeAcc[message.type] = [];
                }
                messagesByTypeAcc[message.type].push(message.data);
                return messagesByTypeAcc;
              }, {} as { [type: string]: Array<any> });

              const actions = [];

              if(typeof messagesByType.Movement !== 'undefined') {
                const assetsMovedData = {assetMovements: messagesByType.Movement.reduce((
                  acc: { [assetId: string]: AssetTypes.AssetMovement }, movement: AssetTypes.Movement
                ) => {
                  if(typeof movement.speed === 'undefined') {
                    acc[movement.asset] = { movement: { ...movement, speed: null }, asset: movement.asset };
                  } else {
                    acc[movement.asset] = { movement, asset: movement.asset };
                  }
                  return acc;
                }, {})};
                actions.push(AssetActions.assetsMoved(assetsMovedData));
                actions.push(AssetActions.checkForAssets({
                  assetIds: messagesByType.Movement.map((movement: AssetTypes.AssetMovement) => movement.asset)
                }));
              }
              if(typeof messagesByType['Updated Asset'] !== 'undefined') {
                actions.push(AssetActions.setAssets({
                  assets: messagesByType['Updated Asset'].reduce((acc, asset: AssetTypes.Asset) => {
                    acc[asset.id] = {
                      asset
                    };
                    return acc;
                  }, {})
                }));
              }
              if(typeof messagesByType['Merged Asset'] !== 'undefined') {
                messagesByType['Merged Asset'].map(message => {
                  const oldAsset = assets[message.oldAssetId];
                  const newAsset = assets[message.newAssetId];
                  let oldAssetName = message.oldAssetId;
                  let newAssetName = message.newAssetId;

                  if(typeof oldAsset !== 'undefined') {
                    oldAssetName = oldAsset.name;
                  }
                  if(typeof newAsset !== 'undefined') {
                    newAssetName = newAsset.name;
                  }
                  const noticeMessage = replacePlaceholdersInTranslation(
                    // tslint:disable-next-line max-line-length
                    $localize`:@@ts-asset-notice-merged:Asset '${oldAssetName}' merged with '${newAssetName}', and has been removed from the map.`,
                    { oldAssetName, newAssetName }
                  );

                  actions.push(NotificationsActions.addNotice(noticeMessage));
                });
                actions.push(AssetActions.removeAssets({ assetIds: messagesByType['Merged Asset'].map(message => message.oldAssetId) }));
              }

              if(typeof messagesByType.Incident !== 'undefined') {
                actions.push(IncidentActions.updateIncidents({
                  incidents: messagesByType.Incident.reduce((acc, message) => {
                    acc[message.id] = message;
                    return acc;
                  }, {})
                }));
              }

              if(typeof messagesByType.IncidentUpdate !== 'undefined') {
                actions.push(IncidentActions.updateIncidents({
                  incidents: messagesByType.IncidentUpdate.reduce((acc, message) => {
                    acc[message.id] = message;
                    return acc;
                  }, {})
                }));
              }

              if(typeof messagesByType.Activity !== 'undefined' && hasActivityFeature) {
                  actions.push(ActivityActions.addActivities({
                    activities: messagesByType.Activity.reduce((
                      acc: { [assetId: string]: ActivityTypes.Activity }, activity: ActivityTypes.Activity
                    ) => {
                      acc[activity.vesselId] = activity;
                      return acc;
                    }, {})
                  }));
              }

              if(actions.length > 0) {
                return of(actions);
              }
            }
            return EMPTY;
          }),
          withLatestFrom(this.store.select(MapSettingsSelectors.getTracksMinuteCap)),
          map(([listOfActions, tracksMinuteCap]: Array<any>) => {
            if(tracksMinuteCap !== null) {
              listOfActions.push(AssetActions.trimTracksThatPassedTimeCap({ unixtime: (Date.now() - (tracksMinuteCap * 60 * 1000))}));
            }
            return listOfActions;
          }),
          // tslint:disable-next-line:comment-format
          //@ts-ignore
          // tslint:disable-next-line:no-shadowed-variable
          mergeMap( (action, index): object => action ),
          catchError((err) => of(AssetActions.failedToSubscribeToMovements({ error: err })))
        ),
      );
    })
  ));

  assetsObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.checkForAssets),
    withLatestFrom(
      this.store.select(AuthSelectors.getAuthToken),
      this.store.select(AssetSelectors.getAssets)
    ),
    mergeMap(([action, authToken, currentAssetList]: Array<any>) => {
      const assetIds: ReadonlyArray<string> = action.assetIds.reduce((acc: any[], assetId: string) => {
        if(currentAssetList[assetId] === undefined) {
          acc.push(assetId);
        }
        return acc;
      }, []);
      if(assetIds.length > 0) {
        return this.assetService.getAssetList(
          authToken, assetIds
        ).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((assets: Array<AssetTypes.Asset>) => {
            return AssetActions.setAssets({
              assets: assets.reduce((acc, asset) => {
                acc[asset.id] = asset;
                return acc;
              }, {})
            });
          })
        );
      } else {
        return EMPTY;
      }
    })
  ));

  selectAssetTrackFromTimeObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getAssetTrackTimeInterval),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrackTimeInterval(authToken, action.assetId, action.startDate, action.endDate, action.sources).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        take(1),
        skipWhile((assetTrack: any) => assetTrack.length === 0),
        map((assetTrack: any) => {
          return AssetActions.setTracksForAsset({ tracks: assetTrack.reverse(), assetId: action.assetId, sources: action.sources });
        })
      );
    })
  ));

  selectAssetTracksFromTimeObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getTracksByTimeInterval),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getTracksByTimeInterval(authToken, action.query, action.startDate, action.endDate, action.sources).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((movements: ReadonlyArray<AssetTypes.Movement>) => {
          const assetMovementsOrdered = movements.slice().reverse().map(movement => ({ movement, asset: movement.asset }));
          const movementsByAsset = assetMovementsOrdered.reduce((accMovementsByAsset, track) => {
            if(typeof accMovementsByAsset.assetMovements[track.asset] === 'undefined') {
              accMovementsByAsset.assetMovements[track.asset] = [];
              accMovementsByAsset.movements[track.asset] = [];
            }
            accMovementsByAsset.assetMovements[track.asset].push(track);
            accMovementsByAsset.movements[track.asset].push(track.movement);

            return accMovementsByAsset;
          }, { assetMovements: {}, movements: {} });

          const lastAssetMovements = Object.keys(movementsByAsset.assetMovements).reduce((accAssetMovements, assetId) => {
            return {
              ...accAssetMovements,
              [assetId]: movementsByAsset.assetMovements[assetId][movementsByAsset.assetMovements[assetId].length - 1]
            };
          }, {});

          return [
            AssetActions.setTracks({ tracksByAsset: movementsByAsset.movements }),
            AssetActions.setAssetPositionsWithoutAffectingTracks({ movementsByAsset: lastAssetMovements }),
            AssetActions.checkForAssets({
              assetIds: Object.values(lastAssetMovements).map((movement: AssetTypes.AssetMovement) => movement.asset)
            }),
            AssetActions.setAssetTrips({ assetMovements: assetMovementsOrdered }),
          ];
        }),
        mergeMap(a => a),
      );
    })
  ));

  getLastFullPositionsForAssetObserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getLastFullPositionsForAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.assetService.getLastFullPositionsForAsset(
          authToken, action.assetId, action.amount, action.sources, action.excludeGivenSources
        ).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((assetMovements: any) => {
            const assetMovementsOrdered = assetMovements.reverse();
            return AssetActions.setLastFullPositions({ fullPositionsByAsset: { [action.assetId]: assetMovementsOrdered } });
          })
        );
      })
    ))
  ));

  getLastPositionsForSelectedAssetbserver$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getLastPositionsForSelectedAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return forkJoin([
          this.assetService.getLastFullPositionsForAsset(authToken, action.assetId, 1, ['AIS']).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          ),
          this.assetService.getLastFullPositionsForAsset(authToken, action.assetId, 1, ['AIS'], true).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          ),
        ]).pipe(
          map((responses: any) => {
            const [ aisPosition, vmsPosition] = responses;

            return AssetActions.setLastPositionsForSelectedAsset({
              assetId: action.assetId,
              aisPosition: aisPosition[0],
              vmsPosition: vmsPosition[0]
            });
          })
        );
      })
    ))
  ));

  getLicenceForAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getLicenceForAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.assetService.getLicenceForAsset(authToken, action.assetId).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((assetLicence: AssetTypes.AssetLicence) => {
            return AssetActions.addAssetLicences({ assetLicences: {
              [action.assetId]: assetLicence
            }});
          })
        );
      })
    ))
  ));

  getAssetUnitTonnage$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getUnitTonnage),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getUnitTonnage(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((unitTonnage: any) => {
          return AssetActions.setUnitTonnage({
            unitTonnages: unitTonnage.map(unit => ({ name: unit.description, code: unit.primaryKey.code }))
          });
        })
      );
    })
  ));

  getSelectedAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getSelectedAsset),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(AssetSelectors.getAssetByUrl),
        this.store.select(RouterSelectors.getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, selectedAsset, mergedRoute]: Array<any>) => {
        if(typeof selectedAsset !== 'undefined' || typeof mergedRoute.params.assetId === 'undefined') {
          return EMPTY;
        }
        return this.assetService.getAsset(authToken, mergedRoute.params.assetId).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((asset: AssetTypes.Asset) => {
            const returnActions: Array<any> = [AssetActions.setFullAsset({ asset })];
            if(typeof asset.mobileTerminalIds !== 'undefined' && asset.mobileTerminalIds.length > 0) {
              returnActions.push(MobileTerminalActions.search({
                query: { mobileTerminalIds: asset.mobileTerminalIds },
                includeArchived: false,
              }));
            }
            return returnActions;
          }),
          mergeMap(a => a)
        );
      })
    ))
  ));

  pollAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.pollAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(AuthSelectors.getUserName)
      ),
      mergeMap(([action, authToken, userName]: Array<any>) => {
        return this.assetService.poll(authToken, action.assetId, action.pollPostObject).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          mergeMap((response: any) => {
            if(typeof response.code !== 'undefined') {
              return [NotificationsActions.addError('Server error: Couldn\'t create a manual poll. Please contact system administrator.')];
            }
            return [NotificationsActions.addNotice('Manual poll initiated. Response is expected within 8 minutes.')];
          })
        );
      })
    ))
  ));

  getLastPollsForAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.getLatestPollsForAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.assetService.getLastPollsForAsset(authToken, action.assetId).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((response: any) => AssetActions.setLastPollsForAsset({
            assetId: action.assetId,
            polls: response
          }))
        );
      })
    ))
  ));

  saveAsset$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.saveAsset),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      const isNew = action.asset.id === undefined || action.asset.id === null;
      let request: Observable<object>;
      if(isNew) {
        request = this.assetService.createAsset(authToken, action.asset);
      } else {
        request = this.assetService.updateAsset(authToken, action.asset);
      }
      return request.pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((asset: AssetTypes.Asset) => {
          let notification = 'Asset updated successfully!';
          this.router.navigate(['/asset/' + asset.id]);
          if(isNew) {
            notification = 'Asset created successfully!';
          }
          return [AssetActions.setAsset({ asset }), NotificationsActions.addSuccess(notification)];
        })
      );
    }),
    mergeMap((action, index) => action)
  ));

  createManualMovement$ = createEffect(() => this.actions$.pipe(
    ofType(AssetActions.createManualMovement),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.createManualMovement(authToken, action.manualMovement).pipe(
        filter((response: any, index: number) => {
          const { body } = response;
          if(
            typeof body !== 'undefined'
            && body !== null
            && (typeof body.code !== 'undefined'
            && typeof body.description !== 'undefined')
            && body.code === 400
          ) {
            this.store.dispatch(NotificationsActions.addError(
              $localize`:@@ts-api-error-manual-movement:Creation of manual position failed!\n Reason:\n` + body.description
            ));
            return false;
          }
          return true;
        }),
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((asset: AssetTypes.Asset) => {
          return [NotificationsActions.addSuccess('Manual position created successfully!')];
        })
      );
    }),
    mergeMap(a => a)
  ));
}
