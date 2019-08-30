import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, flatMap, catchError } from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';
import * as MapSettings from '../map-settings/map-settings.actions';
import { MapSavedFiltersActions } from '../map-saved-filters/';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}

  @Effect()
  login$ = this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap((action: Action) => {
      return this.authService.login(action.username, action.password).pipe(
        map((auth: any) => {
          return AuthActions.loginSuccess({ jwtToken: auth.jwtoken });
        }),
        catchError((err) => of(AuthActions.loginFailed({ error: err })))
      );
    })
  );

  @Effect()
  getUserContext$ = this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    mergeMap((action: Action) => {
      return this.authService.getUserContext(action.jwtToken.raw).pipe(
        map((context: any) => {
          const mapSettings = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapSettings'
          );
          const mapFilters = context.contextSet.contexts[0].preferences.preferences.find(
            (settings) => settings.applicationName === 'VMSMapFilters'
          );

          return [
            new MapSettings.ReplaceSettings(JSON.parse(mapSettings.optionValue)),
            new MapSavedFiltersActions.SetSavedFitlers(JSON.parse(mapFilters.optionValue)),
          ];
        }),
        // tslint:disable-next-line:comment-format
        //@ts-ignore
        // tslint:disable-next-line:no-shadowed-variable
        flatMap( (action, index): object => action ),
        catchError((err) => of(AuthActions.loginFailed({ error: err })))
      );
    })
  );

}
