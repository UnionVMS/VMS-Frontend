import { createReducer, on } from '@ngrx/store';
import * as MapSettingsActions from './map-settings.actions';
import * as Types from './map-settings.types';

export const initialState: Types.State = {
  settings: {
    flagsVisible: false,
    tracksVisible: true,
    namesVisible: false,
    speedsVisible: false,
    forecastsVisible: true,
    forecastInterval: 30,
    tracksMinuteCap: 360,
    startZoomLevel: 6,
    unitOfDistance: 'metric',
    startPosition: {
      latitude: 58.6806116,
      longitude: 14.1047925
    },
    assetColorMethod: 'oldSystemShiptype',
    autoHelp: true,
  },
  mapLocations: {},
  currentControlPanel: null,
  movementSources: [],
  choosenMovementSources: [],
};

export const mapSettingsReducer = createReducer(initialState,
  on(MapSettingsActions.setChoosenMovementSources, (state, { movementSources }) => ({
    ...state,
    choosenMovementSources: movementSources
  })),
  on(MapSettingsActions.setMovementSources, (state, { movementSources }) => ({
    ...state,
    movementSources
  })),
  on(MapSettingsActions.setVisibilityForAssetNames, (state, { visibility }) => ({
    ...state,
    settings: { ...state.settings, namesVisible: visibility }
  })),
  on(MapSettingsActions.setVisibilityForAssetSpeeds, (state, { visibility }) => ({
    ...state,
    settings: { ...state.settings, speedsVisible: visibility }
  })),
  on(MapSettingsActions.setVisibilityForFlags, (state, { visibility }) => ({
    ...state,
    settings: { ...state.settings, flagsVisible: visibility }
  })),
  on(MapSettingsActions.setVisibilityForTracks, (state, { visibility }) => ({
    ...state,
    settings: { ...state.settings, tracksVisible: visibility }
  })),
  on(MapSettingsActions.setVisibilityForForecast, (state, { visibility }) => ({
    ...state,
    settings: { ...state.settings, forecastsVisible: visibility }
  })),
  on(MapSettingsActions.setTracksMinuteCap, (state, { minutes }) => ({
    ...state,
    settings: { ...state.settings, tracksMinuteCap: minutes }
  })),
  on(MapSettingsActions.setForecastInterval, (state, { interval }) => ({
    ...state,
    settings: { ...state.settings, forecastInterval: interval }
  })),
  on(MapSettingsActions.setCurrentControlPanel, (state, { controlPanelName }) => ({
    ...state,
    currentControlPanel: controlPanelName
  })),
  on(MapSettingsActions.saveMapLocation, (state, { key, mapLocation }) => ({
    ...state,
    mapLocations: {
      ...state.mapLocations,
      [key]: mapLocation
    }
  })),
  on(MapSettingsActions.setMapLocations, (state, { mapLocations }) => ({
    ...state,
    mapLocations,
  })),
  on(MapSettingsActions.deleteMapLocation, (state, { key }) => ({
    ...state,
    mapLocations: Object.entries(state.mapLocations).reduce((acc, [locationKey, value]) => {
      const intKey = parseInt(locationKey, 10);
      if(key !== intKey) {
        return { ...acc, [intKey]: value };
      }
      return acc;
    }, {})
  })),
  on(MapSettingsActions.replaceSettings, (state, { settings }) => ({
    ...state,
    settings: { ...state.settings, ...settings }
  })),
);
