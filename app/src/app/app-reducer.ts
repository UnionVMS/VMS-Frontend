import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../environments/environment';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { localStorageSync } from 'ngrx-store-localstorage';

import * as AssetReducer from  './data/asset/asset.reducer';
import * as AuthReducer from  './data/auth/auth.reducer';



export interface State {
  asset: AssetReducer.State;
  auth: AuthReducer.State;
  router: RouterReducerState;
}

export const reducers: ActionReducerMap<State> = {
  asset: AssetReducer.authReducer,
  auth: AuthReducer.authReducer,
  router: routerReducer,
};


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({rehydrate: true, keys: [{auth: ['user']}]})(reducer);
}


export const metaReducers: MetaReducer<State>[] =
  environment.production
    ? [localStorageSyncReducer]
    : [localStorageSyncReducer];
