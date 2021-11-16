import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, interval, Subject } from 'rxjs';
import { map, mergeMap, catchError, filter, takeUntil, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer';

import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';
import * as AuthSelectors from './auth.selectors';
import * as MapSettingsActions from '../map-settings/map-settings.actions';
import * as NotificationsActions from '../notifications/notifications.actions';
import { MapActions } from '@data/map';
import { UserSettingsActions, UserSettingsReducer } from '@data/user-settings';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class AuthEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly store: Store<State>,
    private readonly router: Router,
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap((action: { username: string, password: string, type: string }) => {
      return this.authService.login(action.username, action.password).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index, false)),
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
  ));

  private readonly logoutTimePassed$: Subject<boolean> = new Subject<boolean>();

  setLogoutCountdown$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    mergeMap((action: any) => {
      this.logoutTimePassed$.next(false);
      return interval(60000).pipe( // Every minute (milliseconds)
        takeUntil(this.logoutTimePassed$),
        withLatestFrom(this.store.select(AuthSelectors.getDecodedAuthToken)),
        map(([intervalCount, decodedAuthToken]) => {
          const timeToLogout = Math.round(decodedAuthToken.exp - Date.now() / 1000);
          if(timeToLogout < 0) { // Are we logged out?
            this.store.dispatch(AuthActions.logout());
            this.store.dispatch(AuthActions.activateLoggedOutPopup());
            this.store.dispatch(AuthActions.setTimeToLogout({ timeToLogout: null }));
            // This prevents the returned action from being consumed so we need to dispatch all actions before.
            this.logoutTimePassed$.next(true);
          } else if(timeToLogout < 3600) { // Less then 1 hour (in seconds)
            this.store.dispatch(AuthActions.setTimeToLogout({ timeToLogout }));
          }
        })
      );
    })
  ),
  { dispatch: false }
  );

  getUserContext$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    mergeMap((action: any) => {
      return this.authService.getUserContext(action.payload.jwtToken.raw).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((context: any) => {
          const userContext = context.contextSet.contexts.find(
            (context) => typeof context.scope !== 'undefined'
          )
          const mapSettings = userContext.preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapSettings'
          );
          const mapLocations = userContext.preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapLocations'
          );
          const userSettings = userContext.preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSFrontend'
          );

          const response = [];

          response.push(AuthActions.setRoleAndScope({
            role: {
              name: userContext.role.roleName,
              features: userContext.role.features,
            },
            scope: {
              name: userContext.scope.scopeName,
              datasets: userContext.scope.datasets,
              activeFrom: userContext.scope.activeFrom,
              activeTo: userContext.scope.activeTo,
            }
          }));

          if(typeof userSettings !== 'undefined' && userSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            const userSettingsParsed = JSON.parse(userSettings.optionValue);
            const timezone = userSettingsParsed.timezone || UserSettingsReducer.initialState.timezone;
            response.push(UserSettingsActions.setTimezone({ timezone }));
            response.push(UserSettingsActions.setExperimentalFeaturesEnabled({
              experimentalFeaturesEnabled: userSettingsParsed.experimentalFeaturesEnabled
            }));
          } else {
            response.push(UserSettingsActions.setTimezone({ timezone: UserSettingsReducer.initialState.timezone }));
          }

          if(typeof mapSettings !== 'undefined' && mapSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            response.push(MapSettingsActions.replaceSettings({ settings: JSON.parse(mapSettings.optionValue) }));
          }
          if(typeof mapLocations !== 'undefined' && mapLocations.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            response.push(MapSettingsActions.setMapLocations({ mapLocations: JSON.parse(mapLocations.optionValue) }));
          }
          response.push(MapActions.setMapSettingsLoaded({ mapSettingsLoaded: true }));

          return response;
        }),
        // tslint:disable-next-line:comment-format
        //@ts-ignore
        // tslint:disable-next-line:no-shadowed-variable
        mergeMap( (action, index): object => action ),
        catchError((err) => of(NotificationsActions.addError(err.toString())))
      );
    })
  ));

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    mergeMap((action) => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('ngStorage-token');
      localStorage.removeItem('ngStorage-roleName');
      localStorage.removeItem('ngStorage-scopeName');
      return EMPTY;
    })
  ),{ dispatch: false });
}
