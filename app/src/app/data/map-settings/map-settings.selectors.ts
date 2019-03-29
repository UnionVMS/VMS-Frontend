import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './map-settings.reducer';

export const getMapSettingsState = createFeatureSelector<State>('mapSettings');

export const getTracksMinuteCap = createSelector(
  getMapSettingsState,
  (state: State) => {
    return state.tracksMinuteCap;
  }
)
