import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, concatMap, catchError } from 'rxjs/operators';

import { ActionTypes, LoginSuccess, LoginFailed } from './auth.actions';
import { AuthService } from './auth.service';
import * as MapSettings from '../map-settings/map-settings.actions';

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

          return new MapSettings.ReplaceSettings(JSON.parse(mapSettings.optionValue));
          // return new LoginSuccess(auth.jwtoken);
        }),
        catchError((err) => of(new LoginFailed({ error: err })))
      );
    })
  );

}
