import { Action } from '@ngrx/store';
import { ActionTypes } from './map-settings.actions';

export interface Viewport {
  zoom: number;
  center: Array<number>;
}

export interface State {
  flagsVisible: boolean;
  tracksVisible: boolean;
  namesVisible: boolean;
  speedsVisible: boolean;
  forecastsVisible: boolean;
  forecastInterval: number|null;
  tracksMinuteCap: number|null;
  viewports: { [key: number]: Viewport };
}

export const initialState: State = {
  flagsVisible: false,
  tracksVisible: true,
  namesVisible: false,
  speedsVisible: false,
  forecastsVisible: true,
  forecastInterval: 30,
  tracksMinuteCap: 200,
  viewports: {},
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
    default:
      return state;
  }
}
