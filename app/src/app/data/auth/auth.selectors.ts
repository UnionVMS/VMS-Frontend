import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './auth.interfaces';

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
    let adminAccess = (e) => { if(e === 100000 || e === 100001 || e === 100009 || e === 100010 || e === 100011 ){ returnBoolean = true; }};
    state.user.jwtToken.decoded.features.some( adminAccess );
    return returnBoolean;
  }
);
