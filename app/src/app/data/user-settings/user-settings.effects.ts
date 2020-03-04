import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
import { mergeMap, map, flatMap, withLatestFrom, catchError } from 'rxjs/operators';
// @ts-ignore
import moment from 'moment-timezone';

import { AuthReducer, AuthSelectors } from '../auth';
import { NotificationsActions } from '@data/notifications';

import { UserSettingsSelectors, UserSettingsInterfaces, UserSettingsActions } from './';
import { UserSettingsService } from '@data/user-settings/user-settings.service';

@Injectable()
export class UserSettingsEffects {
  constructor(
    private actions$: Actions,
    private userSettingsService: UserSettingsService,
    private store$: Store<State>
  ) {}

  @Effect()
  setTimezoneObserver$ = this.actions$.pipe(
    ofType(UserSettingsActions.setTimezone),
    mergeMap((action: { timezone: string }) => {
      moment.tz.setDefault(action.timezone);
      return EMPTY;
    })
  );

  @Effect()
  saveTimezoneObserver$ = this.actions$.pipe(
    ofType(UserSettingsActions.saveTimezone),
    mergeMap((action: { timezone: string }) => {
      return of(UserSettingsActions.setTimezone({ timezone: action.timezone })).pipe(
        withLatestFrom(this.store$.select(AuthSelectors.getUser), this.store$.select(UserSettingsSelectors.getUserSettings)),
        mergeMap(([setAction, user, settings]: Array<any>) => {
          return this.userSettingsService.saveUserPreferences(user, settings).pipe(
            map((response: any, index: number) => [
              NotificationsActions.addSuccess($localize`:@@ts-user-settings-saved:Settings saved`),
            ]),
            flatMap(a => a),
            catchError((err) => of({ type: 'API ERROR', payload: err }))
          );
        })
      );
    }),
  );

}
