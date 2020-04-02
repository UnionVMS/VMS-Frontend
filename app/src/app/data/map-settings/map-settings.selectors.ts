import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as MapSettingsInterface from './map-settings.interfaces';
import { State } from '@app/app-reducer';

// const getMapSettingsStateObject = createFeatureSelector<MapSettingsInterface.State>('mapSettings');
export const selectState = (state: State) => state.mapSettings;
export const selectCurrentControlPanel = (state: State) => state.mapSettings.currentControlPanel;
export const selectMapSettings = (state: State) => state.mapSettings.settings;
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
  (state: MapSettingsInterface.State) => state
);

export const getMapSettings = createSelector(
  selectMapSettings,
  (settings: MapSettingsInterface.Settings) => settings
);

export const getTracksMinuteCap = createSelector(
  selectState,
  (state: MapSettingsInterface.State) => state.settings.tracksMinuteCap
);

export const getCurrentControlPanel = createSelector(
  selectCurrentControlPanel,
  (currentControlPanel: string|null) => currentControlPanel
);
