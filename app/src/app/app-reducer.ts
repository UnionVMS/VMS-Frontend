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
