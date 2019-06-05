import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, empty, merge, Observable } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';
import { MapSettingsSelectors } from '../map-settings';

import {
  ActionTypes, SetFullAsset, AssetsMoved, SetAssetTrack, TrimTracksThatPassedTimeCap, SetAssetList,
  SetEssentialProperties
} from './asset.actions';
import { AssetService } from './asset.service';

@Injectable()
export class AssetEffects {
  constructor(
    private actions$: Actions,
    private assetService: AssetService,
    private store$: Store<AuthReducer.State>
  ) {}

  @Effect()
  assetGetListObserver$ = this.actions$.pipe(
    ofType(ActionTypes.GetAssetList),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.listAssets(authToken, action.payload).pipe(
        map((response: any) => {
          return new SetAssetList({
            searchParams: action.payload,
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
    ofType(ActionTypes.UnsubscribeToMovements),
    mergeMap((action) => {
      this.assetService.unsubscribeToMovements();
      return empty();
    })
  );

  @Effect()
  assetMovementSubscribeObserver$ = this.actions$.pipe(
    ofType(ActionTypes.SubscribeToMovements),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return merge(
        this.assetService.getInitalAssetMovements(authToken).pipe(map((assetMovements: any) => {
          return Observable.create((observer) => {
            observer.next(
              new AssetsMoved(assetMovements.microMovements.reduce((acc, assetMovement) => {
                return { ...acc,
                  [assetMovement.asset]: assetMovement
                };
              }, {}))
            );
            observer.next(
              new SetEssentialProperties(assetMovements.assetList.reduce((acc, assetEssentials) => {
                return { ...acc,
                  [assetEssentials.assetId]: assetEssentials
                };
              }, {}))
            );
            observer.complete();
          });
        }), mergeAll()),
        this.assetService.subscribeToMovements(authToken).pipe(
          bufferTime(1000),
          map((assetMovements: Array<any>) => {
            if (assetMovements.length !== 0) {
              return new AssetsMoved(assetMovements.reduce((acc, assetMovement) => {
                return { ...acc,
                  [assetMovement.asset]: assetMovement
                };
              }, {}));
            } else {
              return null;
            }
          }),
          filter(val => val !== null),
          withLatestFrom(this.store$.select(MapSettingsSelectors.getTracksMinuteCap)),
          map(([assetAction, tracksMinuteCap]: Array<any>) => {
            const listOfActions: Array<object> = [assetAction];
            if(tracksMinuteCap !== null) {
              listOfActions.push(new TrimTracksThatPassedTimeCap({ unixtime: (Date.now() - (tracksMinuteCap * 60 * 1000))}));
            }
            return listOfActions;
          }),
          // tslint:disable-next-line:comment-format
          //@ts-ignore
          // tslint:disable-next-line:no-shadowed-variable
          flatMap( (action, index): object => action ),
          catchError((err) => of({ type: ActionTypes.FailedToSubscribeToMovements, payload: err }))
        )
      );
    })
  );

  @Effect()
  selectAssetObserver$ = this.actions$.pipe(
    ofType(ActionTypes.SelectAsset),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAsset(authToken, action.payload).pipe(
        map((asset: any) => {
          return new SetFullAsset(asset);
        })
      );
    })
  );

  @Effect()
  selectAssetTrackObserver$ = this.actions$.pipe(
    ofType(ActionTypes.GetAssetTrack),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrack(authToken, action.payload.movementGuid).pipe(
        map((assetTrack: any) => {
          return new SetAssetTrack({ tracks: assetTrack, assetId: action.payload.assetId, visible: true });
        })
      );
    })
  );

  @Effect()
  selectAssetTrackFromTimeObserver$ = this.actions$.pipe(
    ofType(ActionTypes.GetAssetTrackFromTime),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.assetService.getAssetTrackFromTime(authToken, action.payload.assetId, action.payload.datetime).pipe(
        map((assetTrack: any) => {
          return new SetAssetTrack({ tracks: assetTrack.reverse(), assetId: action.payload.assetId, visible: true });
        })
      );
    })
  );

}
