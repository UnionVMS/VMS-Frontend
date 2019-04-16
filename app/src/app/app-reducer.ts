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

import { AssetReducer, AssetInterfaces } from './data/asset/';
import * as AuthReducer from './data/auth/auth.reducer';
import * as MapSettingsReducer from './data/map-settings/map-settings.reducer';


export interface State {
  asset: AssetInterfaces.State;
  auth: AuthReducer.State;
  mapSettings: MapSettingsReducer.State;
  router: RouterReducerState;
}

export const reducers: ActionReducerMap<State> = {
  asset: AssetReducer.assetReducer,
  auth: AuthReducer.authReducer,
  mapSettings: MapSettingsReducer.mapSettingsReducer,
  router: routerReducer,
};


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({rehydrate: true, keys: [{auth: ['user']}]})(reducer);
}


export const metaReducers: MetaReducer<State>[] =
  environment.production
    ? [localStorageSyncReducer]
    : [localStorageSyncReducer];
