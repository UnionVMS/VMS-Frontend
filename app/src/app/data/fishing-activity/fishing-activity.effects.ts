import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { FishingActivityActions, FishingActivityTypes, FishingActivitySelectors } from './';
import { FishingActivityService } from './fishing-activity.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthTypes, AuthSelectors } from '../auth';
import * as RouterSelectors from '@data/router/router.selectors';

import { hashCode } from '@app/helpers/helpers';

@Injectable()
export class FishingActivityEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<State>,
    private readonly fishingActivityService: FishingActivityService,
    private readonly router: Router
  ) {}

  @Effect()
  search$ = this.actions$.pipe(
    ofType(FishingActivityActions.search),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]) => {
      return this.fishingActivityService.search(authToken, action.query).pipe(
        map((response) => {
          console.warn(response);
          return EMPTY;
          // const result = [
          //   FishingActivityActions.addMobileTerminals({
          //     mobileTerminals: response.fishingActivityList.reduce((acc, mobileTerminal) => {
          //       acc[mobileTerminal.id] = mobileTerminal;
          //       return acc;
          //     }, {})
          //   })
          // ];
          //
          // if(action.saveAsSearchResult === true) {
          //   return [
          //     ...result,
          //     FishingActivityActions.addSearchResult({
          //       uniqueHash: hashCode(JSON.stringify(action.query) + action.includeArchived ? 't' : 'f'),
          //       mobileTerminalIds: response.fishingActivityList.map(mobileTerminal => mobileTerminal.id)
          //     })
          //   ];
          // } else {
          //   return result;
          // }
        }),
        flatMap((rAction, index) => rAction),
        catchError((err) => {
          if(typeof err === 'object' && typeof err.message !== 'undefined') {
            return of(NotificationsActions.addError(err.message));
          }
          return of(NotificationsActions.addError(err.toString()));
        })
      );
    })
  );

}
