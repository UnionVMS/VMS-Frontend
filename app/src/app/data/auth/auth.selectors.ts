import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AuthTypes from './auth.types';
import { State } from '@app/app-reducer';

export const getAuthState = createFeatureSelector<AuthTypes.State>('auth');
export const selectLoggedOutPopupActive = (state: State) => state.auth.loggedOutPopupActive;
export const selectTimeToLogout = (state: State) => state.auth.timeToLogout;
export const selectDecodedAuthToken = (state: State) => state.auth.user.jwtToken.decoded;

export const getAuthToken = createSelector(
  getAuthState,
  (state: AuthTypes.State) => {
    if (state.user !== null) {
      return state.user.jwtToken.raw;
    }
    return null;
  }
);

export const getDecodedAuthToken = createSelector(
  selectDecodedAuthToken,
  (decodedAuthToken: AuthTypes.JwtTokenData) => decodedAuthToken
);

export const getLoggedOutPopupActive = createSelector(
  selectLoggedOutPopupActive,
  (loggedOutPopupActive: boolean) => loggedOutPopupActive
);

export const getTimeToLogout = createSelector(
  selectTimeToLogout,
  (timeToLogout) => timeToLogout
);

export const getUser = createSelector(
  getAuthState,
  (state: AuthTypes.State) => state.user
);

export const getUserName = createSelector(
  getAuthState,
  (state: AuthTypes.State) => {
    if (
      state.user !== null &&
      typeof state.user.data !== 'undefined' &&
      typeof state.user.data.username !== 'undefined'
    ) {
      return state.user.data.username;
    }
    return null;
  }
);

export const isLoggedIn = createSelector(
  getAuthState,
  (state: AuthTypes.State) => {
    if (
      state.user !== null &&
      typeof state.user.data !== 'undefined' &&
      typeof state.user.data.username !== 'undefined'
    ) {
      return true;
    }
    return false;
  }
);

export const isAdmin = createSelector(
  getAuthState,
  (state: AuthTypes.State) => {
    let returnBoolean = false;
    if(
      state.user !== null &&
      typeof state.user.jwtToken !== 'undefined' &&
      typeof state.user.jwtToken.decoded !== 'undefined' &&
      typeof state.user.jwtToken.decoded.features !== 'undefined'
    ) {
      state.user.jwtToken.decoded.features.some((e) => {
        if ( e === 100001 || e === 100018  || e === 100011 || e === 100047 || e === 100030 ) {
          returnBoolean = true;
        }
      });
    }
    return returnBoolean;
  }
);

export const fishingActivityUnlocked = createSelector(
  getAuthState,
  (state: AuthTypes.State) => {
    return state.fishingActivityUnlocked;
  }
);
