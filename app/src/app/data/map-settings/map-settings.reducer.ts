import { Action } from '@ngrx/store';
import { ActionTypes } from './map-settings.actions';
import * as Interfaces from './map-settings.interfaces';

export const initialState: Interfaces.State = {
  flagsVisible: false,
  tracksVisible: true,
  namesVisible: false,
  speedsVisible: false,
  forecastsVisible: true,
  forecastInterval: 30,
  tracksMinuteCap: 200,
  viewports: {},
  startZoomLevel: 10,
  startPosition: {
    latitude: 57.6806116,
    longitude: 12.1047925
  },
  assetColorMethod: 'Shiptype',
};

export function mapSettingsReducer(state = initialState, { type, payload }) {
  switch (type) {
    case ActionTypes.SetVisibilityForAssetNames:
      return { ...state, namesVisible: payload };
    case ActionTypes.SetVisibilityForAssetSpeeds:
      return { ...state, speedsVisible: payload };
    case ActionTypes.SetVisibilityForFlags:
      return { ...state, flagsVisible: payload };
    case ActionTypes.SetVisibilityForTracks:
      return { ...state, tracksVisible: payload };
    case ActionTypes.SetVisibilityForForecast:
      return { ...state, forecastsVisible: payload };
    case ActionTypes.SetTracksMinuteCap:
      return { ...state, tracksMinuteCap: payload };
    case ActionTypes.SetForecastInterval:
      return { ...state, forecastInterval: payload };
    case ActionTypes.SaveViewport:
      return { ...state, viewports: {
        ...state.viewports,
        [payload.key]: payload.viewport
      }};
    case ActionTypes.ReplaceSettings:
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}
