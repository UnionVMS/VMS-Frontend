import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as MapSettingsTypes from './map-settings.types';
import { State } from '@app/app-reducer';

// const getMapSettingsStateObject = createFeatureSelector<MapSettingsInterface.State>('mapSettings');
export const selectState = (state: State) => state.mapSettings;
export const selectCurrentControlPanel = (state: State) => state.mapSettings.currentControlPanel;
export const selectMapSettings = (state: State) => state.mapSettings.settings;
export const selectMapLocations = (state: State) => state.mapSettings.mapLocations;
export const selectMovementSources = (state: State) => state.mapSettings.movementSources;
export const selectChoosenMovementSources = (state: State) => state.mapSettings.choosenMovementSources;


export const getMovementSources = createSelector(
  selectMovementSources,
  (movementSources: ReadonlyArray<string>) => movementSources
);

export const getChoosenMovementSources = createSelector(
  selectChoosenMovementSources,
  (choosenMovementSources: ReadonlyArray<string>) => choosenMovementSources
);

export const getMapSettingsState = createSelector(
  selectState,
  (state: MapSettingsTypes.State) => state
);

export const getMapSettings = createSelector(
  selectMapSettings,
  (settings: MapSettingsTypes.Settings) => settings
);

export const getMapLocations = createSelector(
  selectMapLocations,
  (mapLocations: { readonly [key: number]: MapSettingsTypes.MapLocation }) => mapLocations
);

export const getTracksMinuteCap = createSelector(
  selectState,
  (state: MapSettingsTypes.State) => state.settings.tracksMinuteCap
);

export const getCurrentControlPanel = createSelector(
  selectCurrentControlPanel,
  (currentControlPanel: string|null) => currentControlPanel
);
