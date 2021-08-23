import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, map, withLatestFrom, catchError, filter, tap } from 'rxjs/operators';
// @ts-ignore
import moment from 'moment-timezone';

import { AuthSelectors } from '../auth';
import { NotificationsActions } from '@data/notifications';

import { UserSettingsSelectors, UserSettingsActions } from './';
import { UserSettingsService } from '@data/user-settings/user-settings.service';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class UserSettingsEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly userSettingsService: UserSettingsService,
    private readonly store: Store<State>
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  setTimezoneObserver$ = createEffect(() => this.actions$.pipe(
    ofType(UserSettingsActions.setTimezone),
    tap((action: { timezone: string, save?: boolean }) => { moment.tz.setDefault(action.timezone); }),
    filter((action: { timezone: string, save?: boolean }) => typeof action.save !== 'undefined' && action.save === true),
    // If we should save to DB to, then continue with the rest of this code.
    withLatestFrom(this.store.select(AuthSelectors.getUser), this.store.select(UserSettingsSelectors.getUserSettings)),
    mergeMap(([setAction, user, settings]: Array<any>) => {
      return this.userSettingsService.saveUserPreferences(user, settings).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-user-settings-saved:User settings saved`),
        ]),
        mergeMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  ));

  setExperimentalFeaturesEnabledObserver$ = createEffect(() => this.actions$.pipe(
    ofType(UserSettingsActions.setExperimentalFeaturesEnabled),
    filter((action: { experimentalFeaturesEnabled: boolean, save?: boolean }) =>
      typeof action.save !== 'undefined' && action.save === true
    ),
    // If we should save to DB to, then continue with the rest of this code.
    withLatestFrom(this.store.select(AuthSelectors.getUser), this.store.select(UserSettingsSelectors.getUserSettings)),
    mergeMap(([setAction, user, settings]: Array<any>) => {
      return this.userSettingsService.saveUserPreferences(user, settings).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-user-settings-saved:User settings saved`, 6000),
        ]),
        mergeMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  ));

}
