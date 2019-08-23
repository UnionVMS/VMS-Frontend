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
import { AuthReducer, AuthActions } from './data/auth/';
import { MapSettingsReducer, MapSettingsInterfaces } from './data/map-settings/';
import { MapSavedFiltersReducer, MapSavedFiltersInterfaces } from './data/map-saved-filters/';
import { TrackPanelReducer, TrackPanelInterfaces } from './data/track-panel/';


export interface State {
  asset: AssetInterfaces.State;
  auth: AuthReducer.State;
  mapSettings: MapSettingsInterfaces.State;
  mapSavedFilters: MapSavedFiltersInterfaces.State;
  trackPanel: TrackPanelInterfaces.State;
  router: RouterReducerState;
}

export const reducers: ActionReducerMap<State> = {
  asset: AssetReducer.assetReducer,
  auth: AuthReducer.authReducer,
  mapSettings: MapSettingsReducer.mapSettingsReducer,
  mapSavedFilters: MapSavedFiltersReducer.mapSavedFiltersReducer,
  trackPanel: TrackPanelReducer.trackPanel,
  router: routerReducer,
};


export function saveJwtTokenToStorage(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action: any) => {
    if(action.type === AuthActions.ActionTypes.LoginSuccess) {
      window.localStorage.authToken = action.payload.jwtToken.raw;
    }

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] =
  environment.production
    ? [saveJwtTokenToStorage]
    : [saveJwtTokenToStorage];
