import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
import { map, mergeMap, flatMap, catchError, filter } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';

import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';
import * as MapSettings from '../map-settings/map-settings.actions';
import { MapSavedFiltersActions } from '../map-saved-filters/';
import * as NotificationsActions from '../notifications/notifications.actions';
import { MapActions } from '@data/map';
import { UserSettingsActions, UserSettingsReducer } from '@data/user-settings';

import { apiErrorHandler } from '@app/helpers/api-error-handler';

@Injectable()
export class AuthEffects {

  private readonly apiErrorHandler: (response: any, index: number) => boolean;

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly store: Store<State>,
    private readonly router: Router,
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
  }

  @Effect()
  login$ = this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap((action: { username: string, password: string, type: string }) => {
      return this.authService.login(action.username, action.password).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((auth: any) => {
          this.router.navigate(['/map/realtime']);
          return AuthActions.loginSuccess({ jwtToken: auth.jwtoken });
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

  @Effect()
  getUserContext$ = this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    mergeMap((action: any) => {
      return this.authService.getUserContext(action.payload.jwtToken.raw).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((context: any) => {
          const mapSettings = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapSettings'
          );
          const userSettings = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSFrontend'
          );

          const response = [];

          response.push(AuthActions.setRoleAndScope({
            role: {
              name: context.contextSet.contexts[0].role.roleName,
              features: context.contextSet.contexts[0].role.features,
            },
            scope: {
              name: context.contextSet.contexts[0].scope.scopeName,
              datasets: context.contextSet.contexts[0].scope.datasets,
              activeFrom: context.contextSet.contexts[0].scope.activeFrom,
              activeTo: context.contextSet.contexts[0].scope.activeTo,
            }
          }));

          if(typeof userSettings !== 'undefined' && userSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            const timezone = JSON.parse(userSettings.optionValue).timezone || UserSettingsReducer.initialState.timezone;
            response.push(UserSettingsActions.setTimezone({ timezone }));
          } else {
            response.push(UserSettingsActions.setTimezone({ timezone: UserSettingsReducer.initialState.timezone }));
          }

          if(typeof mapSettings !== 'undefined' && mapSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            response.push(MapSettings.replaceSettings({ settings: JSON.parse(mapSettings.optionValue) }));
          }
          response.push(MapActions.setMapSettingsLoaded({ mapSettingsLoaded: true }));

          return response;
        }),
        // tslint:disable-next-line:comment-format
        //@ts-ignore
        // tslint:disable-next-line:no-shadowed-variable
        flatMap( (action, index): object => action ),
        catchError((err) => of(NotificationsActions.addError(err.toString())))
      );
    })
  );

  @Effect()
  unlockFishingActivity$ = this.actions$.pipe(
    ofType(AuthActions.unlockFishingActivity),
    mergeMap((action) => {
      window.localStorage.fishingActivityUnlocked = true;
      return EMPTY;
    })
  );

  @Effect()
  logout$ = this.actions$.pipe(
    ofType(AuthActions.logout),
    mergeMap((action) => {
      delete window.localStorage.authToken;
      localStorage.removeItem('ngStorage-token');
      localStorage.removeItem('ngStorage-roleName');
      localStorage.removeItem('ngStorage-scopeName');
      delete window.localStorage.fishingActivityUnlocked;
      return EMPTY;
    })
  );
}
