import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTER_NAVIGATED, RouterNavigationAction } from '@ngrx/router-store';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, merge, Observable, interval, Subject } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter, takeUntil } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AuthInterfaces, AuthSelectors } from '../auth';
import { MapSettingsSelectors } from '../map-settings';

import { AssetService } from './asset.service';
import { AssetSelectors, AssetInterfaces, AssetActions } from './';
import * as MapActions from '@data/map/map.actions';
import * as RouterSelectors from '@data/router/router.selectors';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import { MobileTerminalInterfaces, MobileTerminalActions } from '@data/mobile-terminal';

@Injectable()
export class AssetEffects {
  constructor(
    private actions$: Actions,
    private assetService: AssetService,
    private store$: Store<State>,
    private router: Router
  ) {}

  @Effect()
  assetSearchObserver$ = this.actions$.pipe(
    ofType(AssetActions.searchAssets),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, action.searchQuery).pipe(
        map((response: any) => {
          return AssetActions.setAssetList({
            searchParams: action.searchQuery,
            totalNumberOfPages: response.totalNumberOfPages,
            currentPage: response.currentPage,
            assets: response.assetList.reduce((acc, asset) => {
              acc[asset.historyId] = asset;
              return acc;
            }, {})
          });
        })
      );
    })
  );

  @Effect()
  assetGetListObserver$ = this.actions$.pipe(
    ofType(AssetActions.getAssetList),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, { pageSize: action.pageSize } ).pipe(
        map((response: any) => {
          return AssetActions.setAssetList({
            searchParams: action.pageSize,
            totalNumberOfPages: response.totalNumberOfPages,
            currentPage: response.currentPage,
            assets: response.assetList.reduce((acc, asset) => {
              acc[asset.historyId] = asset;
              return acc;
            }, {})
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

  private removeOldAssetsIntervalDone$: Subject<boolean> = new Subject<boolean>();

  // Every 10 minutes
  removeOldAssetsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ROUTER_NAVIGATED),
    mergeMap((action: RouterNavigationAction) => {
      if(action.payload.routerState.url === '/map/realtime') {
        this.removeOldAssetsIntervalDone$.next(false);
        return interval(600000).pipe(
          takeUntil(this.removeOldAssetsIntervalDone$),
          withLatestFrom(this.store$.select(AssetSelectors.selectAssetMovements)),
          mergeMap((
            [ intervalCount, assetMovements ]: [number, { [uid: string]: AssetInterfaces.AssetMovement; }]
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
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return merge(
        this.assetService.getInitalAssetMovements(authToken).pipe(map((assetMovements: any) => {
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
        }), mergeAll()),
        this.assetService.mapSubscription(authToken).pipe(
          bufferTime(1000),
          withLatestFrom(this.store$.select(AssetSelectors.getAssetsEssentials)),
          // We need to add any at the end because the buffer is types as Unknown[], we know it to be the first data
          // structure defined but that does not help apparenlty
          mergeMap(([messages, assetsEssentials]: Array<
            Array<{ type: string, data: any }> | { readonly [uid: string]: AssetInterfaces.AssetEssentialProperties } | any
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
                actions.push(AssetActions.checkForAssetEssentials({ assetMovements: messagesByType.Movement }));
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

                  actions.push(NotificationsActions.addNotice(
                    `Asset '${oldAssetName}' merged with '${newAssetName}', and has been removed from the map.`
                  ));
                });
                actions.push(AssetActions.removeAssets({ assetIds: messagesByType['Merged Asset'].map(message => message.oldAssetId) }));
              }

              if(actions.length > 0) {
                return of(actions);
              }
            }
            return of(null);
          }),
          filter(val => val !== null),
          withLatestFrom(this.store$.select(MapSettingsSelectors.getTracksMinuteCap)),
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
          catchError((err) => of({ type: AssetActions.failedToSubscribeToMovements, payload: err }))
        ),
      );
    })
  );

  @Effect()
  assetEssentialsObserver$ = this.actions$.pipe(
    ofType(AssetActions.checkForAssetEssentials),
    withLatestFrom(
      this.store$.select(AuthSelectors.getAuthToken),
      this.store$.select(AssetSelectors.getAssetsEssentials)
    ),
    mergeMap(([action, authToken, currentAssetsEssentials]: Array<any>) => {
      const assetIdsWithoutEssentials = action.assetMovements.reduce((acc, assetMovement) => {
        if(currentAssetsEssentials[assetMovement.asset] === undefined) {
          acc.push(assetMovement.asset);
        }
        return acc;
      }, []);
      if(assetIdsWithoutEssentials.length > 0) {
        return this.assetService.getAssetEssentialProperties(
          authToken, assetIdsWithoutEssentials
        ).pipe(map((assetsEssentials: Array<AssetInterfaces.AssetEssentialProperties>) => {
          return AssetActions.setEssentialProperties({
            assetEssentialProperties: assetsEssentials.reduce((acc, assetEssentials) => {
              acc[assetEssentials.assetId] = assetEssentials;
              return acc;
            }, {})
          });
        }));
      } else {
        return EMPTY;
      }
    })
  );

  @Effect()
  assetGetGroupsObserver$ = this.actions$.pipe(
    ofType(AssetActions.getAssetGroups),
    withLatestFrom(
      this.store$.select(AuthSelectors.getAuthToken),
      this.store$.select(AuthSelectors.getUserName),
    ),
    mergeMap(([action, authToken, userName]: Array<any>) => {
      return this.assetService.getAssetGroups(authToken, userName).pipe(
        map((response: Array<AssetInterfaces.AssetGroup>) => {
          return AssetActions.setAssetGroups({ assetGroups: response });
        })
      );
    })
  );

  @Effect()
  selectAssetObserver$ = this.actions$.pipe(
    ofType(AssetActions.selectAsset),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAsset(authToken, action.assetId).pipe(
        map((asset: any) => {
          return AssetActions.setFullAsset({ asset });
        })
      );
    })
  );

  @Effect()
  selectAssetTrackFromTimeObserver$ = this.actions$.pipe(
    ofType(AssetActions.getAssetTrackTimeInterval),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrackTimeInterval(authToken, action.assetId, action.startDate, action.endDate).pipe(
        map((assetTrack: any) => {
          return AssetActions.setTracksForAsset({ tracks: assetTrack.reverse(), assetId: action.assetId });
        })
      );
    })
  );

  @Effect()
  selectAssetTracksFromTimeObserver$ = this.actions$.pipe(
    ofType(AssetActions.getTracksByTimeInterval),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getTracksByTimeInterval(authToken, action.assetIds, action.startDate, action.endDate, action.sources).pipe(
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
            AssetActions.checkForAssetEssentials({ assetMovements: Object.values(lastAssetMovements) }),
            AssetActions.setAssetTrips({ assetMovements: assetMovementsOrdered }),
          ];
        }),
        flatMap(a => a),
      );
    })
  );

  @Effect()
  getAssetNotSendingEvents$ = this.actions$.pipe(
    ofType(AssetActions.getAssetNotSendingEvents),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetNotSendingEvents(authToken).pipe(
        map((assetNotSendingEvents: ReadonlyArray<AssetInterfaces.AssetNotSendingEvent>) => {
          return AssetActions.setAssetNotSendingEvents({
            assetNotSendingEvents: assetNotSendingEvents.reduce((acc, assetNotSendingEvent) => {
              acc[assetNotSendingEvent.assetId] = assetNotSendingEvent;
              return acc;
            }, {})
          });
        })
      );
    })
  );

  @Effect()
  getAssetUnitTonnage$ = this.actions$.pipe(
    ofType(AssetActions.getUnitTonnage),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getUnitTonnage(authToken).pipe(
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
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(AssetSelectors.getSelectedAsset),
        this.store$.select(RouterSelectors.getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, selectedAsset, mergedRoute]: Array<any>) => {
        if(typeof selectedAsset !== 'undefined' || typeof mergedRoute.params.assetId === 'undefined') {
          return EMPTY;
        }
        return this.assetService.getAsset(authToken, mergedRoute.params.assetId).pipe(
          map((asset: AssetInterfaces.Asset) => {
            const returnActions: Array<any> = [AssetActions.setFullAsset({ asset })];
            if(asset.mobileTerminalIds.length > 0) {
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
  saveAsset$ = this.actions$.pipe(
    ofType(AssetActions.saveAsset),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      const isNew = action.asset.id === undefined || action.asset.id === null;
      let request: Observable<object>;
      if(isNew) {
        request = this.assetService.createAsset(authToken, action.asset);
      } else {
        request = this.assetService.updateAsset(authToken, action.asset);
      }
      return request.pipe(
        map((asset: AssetInterfaces.Asset) => {
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

}
