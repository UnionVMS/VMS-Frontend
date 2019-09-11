import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, merge, Observable, interval } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AuthInterfaces, AuthSelectors } from '../auth';
import { MapSettingsSelectors } from '../map-settings';

import { AssetService } from './asset.service';
import { AssetSelectors, AssetInterfaces, AssetActions } from './';

@Injectable()
export class AssetEffects {
  constructor(
    private actions$: Actions,
    private assetService: AssetService,
    private store$: Store<State>
  ) {}

  @Effect()
  assetSearchObserver$ = this.actions$.pipe(
    ofType(AssetActions.searchAssets),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, action.requestParams).pipe(
        map((response: any) => {
          return AssetActions.setAssetList({
            searchParams: action.requestParams,
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
      return EMPTY;
    })
  );

  // Every 10 minutes
  removeOldAssetsEffect$ = createEffect(() => interval(600000).pipe(
    withLatestFrom(this.store$.select(AssetSelectors.selectAssetMovements)),
    mergeMap(([ intervalCount, assetMovements ]: [number, { [uid: string]: AssetInterfaces.AssetMovement; }] ): Observable<Action> => {
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
          AssetActions.removeAssets({ assets: positionsToRemoveOrUpdate.assetsToDelete }),
          AssetActions.updateDecayOnAssetPosition({ assetMovements: positionsToRemoveOrUpdate.decayingAssets })
        );
      }
      if(positionsToRemoveOrUpdate.assetsToDelete.length > 0) {
        return of(AssetActions.removeAssets({ assets: positionsToRemoveOrUpdate.assetsToDelete }));
      }
      if(Object.keys(positionsToRemoveOrUpdate.decayingAssets).length > 0) {
        return of(AssetActions.updateDecayOnAssetPosition({ assetMovements: positionsToRemoveOrUpdate.decayingAssets }));
      }
      return EMPTY;
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
            observer.complete();
          });
        }), mergeAll()),
        this.assetService.subscribeToMovements(authToken).pipe(
          bufferTime(1000),
          map((assetMovements: Array<any>) => {
            if (assetMovements.length !== 0) {
              return [
                AssetActions.assetsMoved({assetMovements: assetMovements.reduce((acc, assetMovement) => {
                  if(typeof assetMovement.microMove.speed === 'undefined') {
                    assetMovement.microMove.speed = null;
                  }
                  acc[assetMovement.asset] = assetMovement;
                  return acc;
                }, {})}),
                AssetActions.checkForAssetEssentials({assetMovements})
              ];
            } else {
              return null;
            }
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
        this.assetService.subscribeToAssetUpdates(authToken).pipe(
          bufferTime(500),
          map((assetsEssentials: Array<any>) => {
            if (assetsEssentials.length !== 0) {
              return AssetActions.setEssentialProperties(assetsEssentials.reduce((acc, assetEssentials) => {
                acc[assetEssentials.assetId] = assetEssentials;
                return acc;
              }, {}));
            } else {
              return null;
            }
          }),
          filter(val => val !== null)
        )
      );
    })
  );

  @Effect()
  assetEssentialsObserver$ = this.actions$.pipe(
    ofType(AssetActions.checkForAssetEssentials),
    withLatestFrom(
      this.store$.select(AuthSelectors.getAuthToken),
      // tslint:disable-next-line:comment-format
      //@ts-ignore
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
        map((response: any) => {
          return AssetActions.setAssetGroups(response);
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
  selectAssetTrackObserver$ = this.actions$.pipe(
    ofType(AssetActions.getAssetTrack),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrack(authToken, action.movementGuid).pipe(
        map((assetTrack: any) => {
          return ({ tracks: assetTrack, assetId: action.assetId, visible: true });
        })
      );
    })
  );

  @Effect()
  selectAssetTrackFromTimeObserver$ = this.actions$.pipe(
    ofType(AssetActions.getAssetTrackFromTime),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrackFromTime(authToken, action.assetId, action.datetime).pipe(
        map((assetTrack: any) => {
          return AssetActions.setAssetTrack({ tracks: assetTrack.reverse(), assetId: action.assetId, visible: true });
        })
      );
    })
  );

}
