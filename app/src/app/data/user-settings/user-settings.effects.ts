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

import { apiErrorHandler } from '@app/helpers/api-error-handler';

@Injectable()
export class UserSettingsEffects {

  private apiErrorHandler: (response: any, index: number) => boolean;

  constructor(
    private readonly actions$: Actions,
    private readonly userSettingsService: UserSettingsService,
    private readonly store$: Store<State>
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store$);
  }

  @Effect()
  setTimezoneObserver$ = this.actions$.pipe(
    ofType(UserSettingsActions.setTimezone),
    mergeMap((action: { timezone: string, save?: boolean }) => {
      moment.tz.setDefault(action.timezone);
      if (typeof action.save !== 'undefined' && action.save === true) {
        return of(action);
      }
      return EMPTY;
    }),
    // If we should save to DB to, then continue with the rest of this code.
    withLatestFrom(this.store$.select(AuthSelectors.getUser), this.store$.select(UserSettingsSelectors.getUserSettings)),
    mergeMap(([setAction, user, settings]: Array<any>) => {
      return this.userSettingsService.saveUserPreferences(user, settings).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-user-settings-saved:Settings saved`),
        ]),
        flatMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );
}
