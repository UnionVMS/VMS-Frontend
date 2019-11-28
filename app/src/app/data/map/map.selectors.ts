import { createSelector } from '@ngrx/store';
import * as MapInterfaces from './map.interfaces';
import { State } from '@app/app-reducer';

export const selectRealtimeMapReady = (state: State) => state.map.realtime.ready;
export const selectMapSettingsLoaded = (state: State) => state.map.mapSettingsLoaded;
export const selectFiltersActive = (state: State) => state.map.filtersActive;

export const getRealtimeReadyAndSettingsLoaded = createSelector(
  selectRealtimeMapReady,
  selectMapSettingsLoaded,
  (ready: boolean, mapSettingsLoaded: boolean) => ({ ready, mapSettingsLoaded })
);

export const getFiltersActive = createSelector(
  selectFiltersActive,
  (filtersActive) => filtersActive
);
