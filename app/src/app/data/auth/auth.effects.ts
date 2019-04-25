import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, concatMap, catchError } from 'rxjs/operators';

import { ActionTypes, LoginSuccess, LoginFailed } from './auth.actions';
import { AuthService } from './auth.service';

@Injectable()
export class AuthEffects {

  @Effect()
  login$ = this.actions$
    .pipe(
      ofType(ActionTypes.Login),
      mergeMap((action: Action) => {
        return this.authService.login(action.payload.username, action.payload.password)
          .pipe(
            map((auth: any) => {
              return new LoginSuccess(auth.jwtoken);
            }),
            catchError((err) => of(new LoginFailed({ error: err })))
          );
      })
    );

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}
}
