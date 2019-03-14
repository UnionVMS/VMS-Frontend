import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Subscription, of, empty, isObservable, defer } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, bufferTime, filter, tap } from 'rxjs/operators';
import jwtDecode from 'jwt-decode';

import { AuthReducer, AuthSelectors } from '../auth';

import { ActionTypes } from './asset.actions';
import { Asset } from './asset.reducer';
import { AssetService } from './asset.service';

@Injectable()
export class AssetEffects {

  private movementSubscription: Subscription;

  @Effect()
  assetMovementObserver$ = this.actions$
    .pipe(
      ofType(ActionTypes.SubscribeToMovements),
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]) => {
        return this.assetService.SubscribeToMovements(authToken)
          .pipe(
            bufferTime(1000),
            map((assets: Array<any>) => {
              if(assets.length !== 0) {
                return {
                  type: ActionTypes.AssetsMoved,
                  payload: assets.reduce((acc, asset) => {
                    return { ...acc,
                      [asset.asset]: asset
                    };
                  }, {})
                };
              } else {
                return null;
              }
            }),
            filter(val => val !== null),
            catchError((err) => of({ type: ActionTypes.FailedToSubscribeToMovements, payload: err }))
          );
        // .subscribe((asset: any) => {
        //   console.warn(asset);
        //   return {
        //     type: ActionTypes.SubscribedToMovements,
        //     payload: asset
        //   };
        // });
          // .pipe(
          //   map((asset: any) => {
          //     console.warn(asset);
          //     return {
          //       type: ActionTypes.SubscribedToMovements,
          //       payload: asset
          //     };
          //   }),
          //   catchError((err) => of({ type: ActionTypes.FailedToSubscribeToMovements, payload: err }))
          // );
      })
    );

  constructor(
    private actions$: Actions,
    private assetService: AssetService,
    private store$: Store<AuthReducer.State>
  ) {}
}
