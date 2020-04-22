import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
import { mergeMap, map, flatMap, withLatestFrom, catchError, filter } from 'rxjs/operators';
// @ts-ignore
import moment from 'moment-timezone';

import { AuthReducer, AuthSelectors } from '../auth';
import { NotificationsActions } from '@data/notifications';

import { UserSettingsSelectors, UserSettingsTypes, UserSettingsActions } from './';
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
    mergeMap((action: { timezone: string, save?: boolean }) => {
      moment.tz.setDefault(action.timezone);
      if (typeof action.save !== 'undefined' && action.save === true) {
        return of(action);
      }
      return of(null);
    }),
    filter(val => val !== null),
    // If we should save to DB to, then continue with the rest of this code.
    withLatestFrom(this.store$.select(AuthSelectors.getUser), this.store$.select(UserSettingsSelectors.getUserSettings)),
    mergeMap(([setAction, user, settings]: Array<any>) => {
      console.warn(settings);
      return this.userSettingsService.saveUserPreferences(user, settings).pipe(
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-user-settings-saved:Settings saved`),
        ]),
        flatMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );
}
