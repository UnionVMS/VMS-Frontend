import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, flatMap, catchError } from 'rxjs/operators';

import { ActionTypes, LoginSuccess, LoginFailed } from './auth.actions';
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
    ofType(ActionTypes.Login),
    mergeMap((action: Action) => {
      return this.authService.login(action.payload.username, action.payload.password).pipe(
        map((auth: any) => {
          return new LoginSuccess(auth.jwtoken);
        }),
        catchError((err) => of(new LoginFailed({ error: err })))
      );
    })
  );

  @Effect()
  getUserContext$ = this.actions$.pipe(
    ofType(ActionTypes.LoginSuccess),
    mergeMap((action: Action) => {
      return this.authService.getUserContext(action.payload.jwtToken.raw).pipe(
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
        catchError((err) => of(new LoginFailed({ error: err })))
      );
    })
  );

}
