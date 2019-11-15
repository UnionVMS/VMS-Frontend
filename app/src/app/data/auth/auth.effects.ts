import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, flatMap, catchError } from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';
import * as MapSettings from '../map-settings/map-settings.actions';
import { MapSavedFiltersActions } from '../map-saved-filters/';
import * as NotificationsActions from '../notifications/notifications.actions';
import { MapActions } from '@data/map';


@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
  ) {}

  @Effect()
  login$ = this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap((action: { username: string, password: string, type: string }) => {
      return this.authService.login(action.username, action.password).pipe(
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
        map((context: any) => {
          const mapSettings = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapSettings'
          );
          const mapFilters = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapFilters'
          );

          const response = [];
          if(typeof mapSettings !== 'undefined' && mapSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            response.push(MapSettings.replaceSettings({ settings: JSON.parse(mapSettings.optionValue) }));
            response.push(MapActions.setMapSettingsLoaded({ mapSettingsLoaded: true }));
          }
          if(typeof mapFilters !== 'undefined' && mapSettings.optionValue !== 'SYSTEM_DEFAULT_VALUE') {
            response.push(MapSavedFiltersActions.setSavedFitlers({ filters: JSON.parse(mapFilters.optionValue) }));
          }
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

}
