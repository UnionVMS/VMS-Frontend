import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTER_NAVIGATED, RouterNavigationAction } from '@ngrx/router-store';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, merge, Observable, interval, Subject, forkJoin } from 'rxjs';
import {
  map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter, takeUntil, take, skipWhile
} from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AuthTypes, AuthSelectors } from '../auth';
import { MapSettingsSelectors } from '../map-settings';

import { AssetService } from './asset.service';
import { AssetSelectors, AssetTypes, AssetActions } from './';
import { IncidentActions, IncidentTypes } from '@data/incident';
import * as MapActions from '@data/map/map.actions';
import * as RouterSelectors from '@data/router/router.selectors';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import { MobileTerminalTypes, MobileTerminalActions } from '@data/mobile-terminal';

import { replaceDontTranslate } from '@app/helpers/helpers';
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

  @Effect()
  assetSearchObserver$ = this.actions$.pipe(
    ofType(AssetActions.searchAssets),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, action.searchQuery).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any) => {
          return AssetActions.setAssetList({
            searchQuery: action.searchQuery,
            assets: response.assetList.reduce((acc, asset) => {
              acc[asset.historyId] = asset;
              return acc;
            }, {}),
            userSearch: action.userSearch === true
          });
        })
      );
    })
  );

  @Effect()
  assetMovementUnsubscribeObserver$ = this.actions$.pipe(
    ofType(AssetActions.unsubscribeToMovements),
    mergeMap((action) => {
      this.assetService.unsubscribeToMovements();
      return of(MapActions.setReady({ ready: false }));
    })
  );

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
                const date = new Date(assetMovement.microMove.timestamp);
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


  @Effect()
  assetMovementSubscribeObserver$ = this.actions$.pipe(
    ofType(AssetActions.subscribeToMovements),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return merge(
        this.assetService.getInitalAssetMovements(authToken).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((assetMovements: any) => {
            return new Observable((observer) => {
              observer.next(
                AssetActions.assetsMoved({
                  assetMovements: assetMovements.microMovements.reduce((acc, assetMovement) => {
                    if(typeof assetMovement.microMove.speed === 'undefined') {
                      assetMovement.microMove.speed = null;
                    }
                    acc[assetMovement.asset] = assetMovement;
                    return acc;
                  }, {})
                })
              );

              observer.next(
                AssetActions.setEssentialProperties({
                  assetEssentialProperties: assetMovements.assetList.reduce((acc, assetEssentials) => {
                    acc[assetEssentials.assetId] = assetEssentials;
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
          withLatestFrom(this.store.select(AssetSelectors.getAssetsEssentials)),
          // We need to add any at the end because the buffer is types as Unknown[], we know it to be the first data
          // structure defined but that does not help apparenlty
          mergeMap(([messages, assetsEssentials]: Array<
            Array<{ type: string, data: any }> | { readonly [uid: string]: AssetTypes.AssetEssentialProperties } | any
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
                const assetsMovedData = {assetMovements: messagesByType.Movement.reduce((acc, assetMovement) => {
                  if(typeof assetMovement.microMove.speed === 'undefined') {
                    assetMovement.microMove.speed = null;
                  }
                  acc[assetMovement.asset] = assetMovement;
                  return acc;
                }, {})};
                actions.push(AssetActions.assetsMoved(assetsMovedData));
                actions.push(AssetActions.checkForAssetEssentials({
                  assetIds: messagesByType.Movement.map((movement: AssetTypes.AssetMovement) => movement.asset)
                }));
              }
              if(typeof messagesByType['Updated Asset'] !== 'undefined') {
                actions.push(AssetActions.setEssentialProperties({
                  assetEssentialProperties: messagesByType['Updated Asset'].reduce((acc, assetEssentials) => {
                    acc[assetEssentials.assetId] = assetEssentials;
                    return acc;
                  }, {})
                }));
              }
              if(typeof messagesByType['Merged Asset'] !== 'undefined') {
                messagesByType['Merged Asset'].map(message => {
                  const oldAsset = assetsEssentials[message.oldAssetId];
                  const newAsset = assetsEssentials[message.newAssetId];
                  let oldAssetName = message.oldAssetId;
                  let newAssetName = message.newAssetId;

                  if(typeof oldAsset !== 'undefined') {
                    oldAssetName = oldAsset.assetName;
                  }
                  if(typeof newAsset !== 'undefined') {
                    newAssetName = newAsset.assetName;
                  }

                  const noticeMessage = replaceDontTranslate(
                    // tslint:disable-next-line max-line-length
                    $localize`:@@ts-asset-notice-merged:Asset '${oldAssetName}' merged with '${newAssetName}', and has been removed from the map.`,
                    { oldAssetName, newAssetName }
                  );

                  actions.push(NotificationsActions.addNotice(noticeMessage));
                });
                actions.push(AssetActions.removeAssets({ assetIds: messagesByType['Merged Asset'].map(message => message.oldAssetId) }));
              }

              if(typeof messagesByType.Incident !== 'undefined') {
                // messagesByType.Incident.map(message => {
                //   actions.push(NotificationsActions.addNotice(
                //     `New incident #${message.id} for ${message.assetName}.`
                //   ));
                // });
                actions.push(IncidentActions.updateIncidents({
                  incidents: messagesByType.Incident.reduce((acc, message) => {
                    acc[message.id] = message;
                    return acc;
                  }, {})
                }));
              }

              if(typeof messagesByType.IncidentUpdate !== 'undefined') {
                // messagesByType.IncidentUpdate.map(message => {
                //   actions.push(NotificationsActions.addNotice(
                //     `Incident #${message.id} for asset ${message.assetName} updated.`
                //   ));
                // });
                actions.push(IncidentActions.updateIncidents({
                  incidents: messagesByType.IncidentUpdate.reduce((acc, message) => {
                    acc[message.id] = message;
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
          flatMap( (action, index): object => action ),
          catchError((err) => of(AssetActions.failedToSubscribeToMovements({ error: err })))
        ),
      );
    })
  );

  @Effect()
  assetEssentialsObserver$ = this.actions$.pipe(
    ofType(AssetActions.checkForAssetEssentials),
    withLatestFrom(
      this.store.select(AuthSelectors.getAuthToken),
      this.store.select(AssetSelectors.getAssetsEssentials)
    ),
    mergeMap(([action, authToken, currentAssetsEssentials]: Array<any>) => {
      const assetIdsWithoutEssentials: ReadonlyArray<string> = action.assetIds.reduce((acc, assetId) => {
        if(currentAssetsEssentials[assetId] === undefined) {
          acc.push(assetId);
        }
        return acc;
      }, []);
      if(assetIdsWithoutEssentials.length > 0) {
        return this.assetService.getAssetEssentialProperties(
          authToken, assetIdsWithoutEssentials
        ).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((assetsEssentials: Array<AssetTypes.AssetEssentialProperties>) => {
            return AssetActions.setEssentialProperties({
              assetEssentialProperties: assetsEssentials.reduce((acc, assetEssentials) => {
                acc[assetEssentials.assetId] = assetEssentials;
                return acc;
              }, {})
            });
          })
        );
      } else {
        return EMPTY;
      }
    })
  );

  @Effect()
  selectAssetObserver$ = this.actions$.pipe(
    ofType(AssetActions.selectAsset),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAsset(authToken, action.assetId).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((asset: any) => {
          return AssetActions.setFullAsset({ asset });
        })
      );
    })
  );

  @Effect()
  selectAssetTrackFromTimeObserver$ = this.actions$.pipe(
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
  );

  @Effect()
  selectAssetTracksFromTimeObserver$ = this.actions$.pipe(
    ofType(AssetActions.getTracksByTimeInterval),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getTracksByTimeInterval(authToken, action.query, action.startDate, action.endDate, action.sources).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((assetMovements: any) => {
          const assetMovementsOrdered = assetMovements.reverse();
          const movementsByAsset = assetMovementsOrdered.reduce((accMovementsByAsset, track) => {
            if(typeof accMovementsByAsset.assetMovements[track.asset] === 'undefined') {
              accMovementsByAsset.assetMovements[track.asset] = [];
              accMovementsByAsset.movements[track.asset] = [];
            }
            accMovementsByAsset.assetMovements[track.asset].push(track);
            accMovementsByAsset.movements[track.asset].push(track.microMove);

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
            AssetActions.checkForAssetEssentials({
              assetIds: Object.values(lastAssetMovements).map((movement: AssetTypes.AssetMovement) => movement.asset)
            }),
            AssetActions.setAssetTrips({ assetMovements: assetMovementsOrdered }),
          ];
        }),
        flatMap(a => a),
      );
    })
  );

  @Effect()
  getLastFullPositionsForAssetObserver$ = this.actions$.pipe(
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
  );

  @Effect()
  getLastPositionsForSelectedAssetbserver$ = this.actions$.pipe(
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
  );

  @Effect()
  getLicenceForAsset$ = this.actions$.pipe(
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
  );

  @Effect()
  getAssetUnitTonnage$ = this.actions$.pipe(
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
  );

  @Effect()
  getSelectedAsset$ = this.actions$.pipe(
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
                query: { mobileterminalIds: asset.mobileTerminalIds },
                includeArchived: false,
              }));
            }
            return returnActions;
          }),
          flatMap(a => a)
        );
      })
    ))
  );

  @Effect()
  pollAsset$ = this.actions$.pipe(
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
            return [NotificationsActions.addSuccess('Manual poll initiated. Response can take anywhere from a few minutes up to a couple of hours.')];
          })
        );
      })
    ))
  );

  @Effect()
  getLastPollsForAsset$ = this.actions$.pipe(
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
  );


  @Effect()
  saveAsset$ = this.actions$.pipe(
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
    flatMap((action, index) => action)
  );

  @Effect()
  createManualMovement$ = this.actions$.pipe(
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
              $localize`:@@ts-api-error-manual-movement:Creation of manual position failed!<br />\n Reason:<br />\n` + body.description
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
    flatMap(a => a)
  );
}
