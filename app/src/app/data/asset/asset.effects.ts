import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, empty, isObservable, defer } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';
import jwtDecode from 'jwt-decode';

import { AuthReducer, AuthSelectors } from '../auth';
import { MapSettingsReducer, MapSettingsSelectors } from '../map-settings';

import { ActionTypes, SetFullAsset, AssetsMoved, SetAssetTrack, TrimTracksThatPassedTimeCap } from './asset.actions';
import { Asset } from './asset.reducer';
import { AssetService } from './asset.service';

@Injectable()
export class AssetEffects {
  constructor(
    private actions$: Actions,
    private assetService: AssetService,
    private store$: Store<AuthReducer.State>
  ) {}

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
      return this.assetService.subscribeToMovements(authToken).pipe(
        bufferTime(1000),
        map((assets: Array<any>) => {
          if (assets.length !== 0) {
            return new AssetsMoved(assets.reduce((acc, asset) => {
              return { ...acc,
                [asset.asset]: asset
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
        // tslint:disable-next-line:no-shadowed-variable
        flatMap( (action, index): object => action ),
        catchError((err) => of({ type: ActionTypes.FailedToSubscribeToMovements, payload: err }))
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
          return new SetAssetTrack({ tracks: assetTrack, assetId: action.payload.assetId, visible: true });
        })
      );
    })
  );

}
