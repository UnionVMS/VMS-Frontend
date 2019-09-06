import { createReducer, on } from '@ngrx/store';
import * as MapSettingsActions from './map-settings.actions';
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
  currentControlPanel: null,
};

export const mapSettingsReducer = createReducer(initialState,
  on(MapSettingsActions.setVisibilityForAssetNames, (state, { visibility }) => ({
    ...state,
    namesVisible: visibility
  })),
  on(MapSettingsActions.setVisibilityForAssetSpeeds, (state, { visibility }) => ({
    ...state,
    speedsVisible: visibility
  })),
  on(MapSettingsActions.setVisibilityForFlags, (state, { visibility }) => ({
    ...state,
    flagsVisible: visibility
  })),
  on(MapSettingsActions.setVisibilityForTracks, (state, { visibility }) => ({
    ...state,
    tracksVisible: visibility
  })),
  on(MapSettingsActions.setVisibilityForForecast, (state, { visibility }) => ({
    ...state,
    forecastsVisible: visibility
  })),
  on(MapSettingsActions.setTracksMinuteCap, (state, { minutes }) => ({
    ...state,
    tracksMinuteCap: minutes
  })),
  on(MapSettingsActions.setForecastInterval, (state, { interval }) => ({
    ...state,
    forecastInterval: interval
  })),
  on(MapSettingsActions.setCurrentControlPanel, (state, { controlPanelName }) => ({
    ...state,
    currentControlPanel: controlPanelName
  })),
  on(MapSettingsActions.saveViewport, (state, { key, viewport }) => ({
    ...state,
    viewports: {
      ...state.viewports,
      [key]: viewport
    }
  })),
  on(MapSettingsActions.replaceSettings, (state, { settings }) => ({
    ...settings
  })),
);
