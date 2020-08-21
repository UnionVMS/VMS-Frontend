import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './auth.types';

export const getAuthState = createFeatureSelector<State>('auth');

export const getAuthToken = createSelector(
  getAuthState,
  (state: State) => {
    if (state.user !== null) {
      return state.user.jwtToken.raw;
    }
    return null;
  }
);

export const getUser = createSelector(
  getAuthState,
  (state: State) => state.user
);

export const getUserName = createSelector(
  getAuthState,
  (state: State) => {
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
  (state: State) => {
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
  (state: State) => {
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
  (state: State) => {
    return state.fishingActivityUnlocked;
  }
);
