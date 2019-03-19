import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './auth.reducer';

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
