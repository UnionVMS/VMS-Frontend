import { Action, createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import * as AuthInterfaces from './auth.interfaces';

export const initialState: AuthInterfaces.State = {
  user: null,
};

export const authReducer = createReducer(initialState,
  on(AuthActions.loginFailed, (state, { error }) => ({
    ...state,
  })),
  on(AuthActions.loginSuccess, (state, { payload: { jwtToken, data } }) => ({
    ...state,
    user: {
      ...state.user,
      jwtToken,
      data
    }
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null
  })),
);
