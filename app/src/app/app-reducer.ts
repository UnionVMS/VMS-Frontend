import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../environments/environment';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';

import { AssetReducer, AssetInterfaces } from './data/asset/';
import { AuthReducer, AuthInterfaces, AuthActions } from './data/auth/';
import { MapSettingsReducer, MapSettingsInterfaces } from './data/map-settings/';
import { MapLayersReducer, MapLayersInterfaces } from './data/map-layers/';
import { MapSavedFiltersReducer, MapSavedFiltersInterfaces } from './data/map-saved-filters/';


export interface State {
  asset: AssetInterfaces.State;
  auth: AuthInterfaces.State;
  mapLayers: MapLayersInterfaces.State;
  mapSettings: MapSettingsInterfaces.State;
  mapSavedFilters: MapSavedFiltersInterfaces.State;
  router: RouterReducerState;
}

export const reducers: ActionReducerMap<State> = {
  asset: AssetReducer.assetReducer,
  auth: AuthReducer.authReducer,
  mapLayers: MapLayersReducer.mapLayersReducer,
  mapSettings: MapSettingsReducer.mapSettingsReducer,
  mapSavedFilters: MapSavedFiltersReducer.mapSavedFiltersReducer,
  router: routerReducer,
};


export function saveJwtTokenToStorage(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action: any) => {
    if(action.type === AuthActions.loginSuccess.type) {
      window.localStorage.authToken = action.payload.jwtToken.raw;
    }

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] =
  environment.production
    ? [saveJwtTokenToStorage]
    : [saveJwtTokenToStorage];
