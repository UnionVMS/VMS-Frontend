import { Action, createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import * as Types from './auth.types';
import { environment } from '../../../environments/environment';

export const initialState: Types.State = {
  user: null,
  fishingActivityUnlocked: environment.fishingActivityDefaultUnlocked,
  loggedOutPopupActive: false,
  timeToLogout: null,
};

export const authReducer = createReducer(initialState,
  on(AuthActions.loginSuccess, (state, { payload: { jwtToken, data } }) => ({
    ...state,
    user: {
      ...state.user,
      jwtToken,
      data
    }
  })),
  on(AuthActions.updateToken, (state, { payload: { jwtToken, data } }) => ({
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
  on(AuthActions.setRoleAndScope, (state, { role, scope }) => ({
    ...state,
    user: {
      ...state.user,
      role,
      scope
    }
  })),
  on(AuthActions.setTimeToLogout, (state, { timeToLogout }) => ({
    ...state,
    timeToLogout
  })),
  on(AuthActions.unlockFishingActivity, (state) => ({
    ...state,
    fishingActivityUnlocked: true
  })),
  on(AuthActions.activateLoggedOutPopup, (state) => ({
    ...state,
    loggedOutPopupActive: true
  })),
);
