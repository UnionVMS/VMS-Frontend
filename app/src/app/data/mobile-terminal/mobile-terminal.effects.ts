import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import * as MobileTerminalActions from './mobile-terminal.actions';
import { MobileTerminalService } from './mobile-terminal.service';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthInterfaces, AuthSelectors } from '../auth';

@Injectable()
export class MobileTerminalEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<State>,
    private mobileTerminalService: MobileTerminalService
  ) {}

  @Effect()
  search$ = this.actions$.pipe(
    ofType(MobileTerminalActions.search),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]) => {
      return this.mobileTerminalService.search(authToken, action.query, action.includeArchived).pipe(
        map((mobileTerminals: Array<MobileTerminalInterfaces.MobileTerminal>) => {
          return MobileTerminalActions.addMobileTerminals({ mobileTerminals });
        }),
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
