import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './map-settings.interfaces';

const getMapSettingsStateObject = createFeatureSelector<State>('mapSettings');

export const getMapSettingsState = createSelector(
  getMapSettingsStateObject,
  (state: State) => {
    return { ...state };
  }
);

export const getTracksMinuteCap = createSelector(
  getMapSettingsStateObject,
  (state: State) => {
    return state.tracksMinuteCap;
  }
);
