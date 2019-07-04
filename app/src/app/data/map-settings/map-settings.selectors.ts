import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as MapSettingsInterface from './map-settings.interfaces';
import { State } from '@app/app-reducer';

const getMapSettingsStateObject = createFeatureSelector<MapSettingsInterface.State>('mapSettings');
// export const selectTracksMinuteCap = (state: State) => state.mapSettings.tracksMinuteCap;
export const selectCurrentControlPanel = (state: State) => state.mapSettings.currentControlPanel;


export const getMapSettingsState = createSelector(
  getMapSettingsStateObject,
  (state: MapSettingsInterface.State) => {
    return { ...state };
  }
);

export const getTracksMinuteCap = createSelector(
  getMapSettingsStateObject,
  (state: MapSettingsInterface.State) => {
    return state.tracksMinuteCap;
  }
);

export const getCurrentControlPanel = createSelector(
  selectCurrentControlPanel,
  (currentControlPanel: string|null) => {
    return currentControlPanel;
  }
);
