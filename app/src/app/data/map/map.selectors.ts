import { createSelector } from '@ngrx/store';
import * as MapTypes from './map.types';
import { State } from '@app/app-reducer';

export const selectRealtimeMapReady = (state: State) => state.map.realtime.ready;
export const selectMapSettingsLoaded = (state: State) => state.map.mapSettingsLoaded;
export const selectFiltersActive = (state: State) => state.map.filtersActive;
export const selectActiveLeftPanel = (state: State) => state.map.activeLeftPanel;
export const selectActiveRightPanel = (state: State) => state.map.activeRightPanel;

export const getRealtimeReadyAndSettingsLoaded = createSelector(
  selectRealtimeMapReady,
  selectMapSettingsLoaded,
  (ready: boolean, mapSettingsLoaded: boolean) => ({ ready, mapSettingsLoaded })
);

export const getFiltersActive = createSelector(
  selectFiltersActive,
  (filtersActive) => filtersActive
);

export const getActiveLeftPanel = createSelector(
  selectActiveLeftPanel,
  (activeLeftPanel) => activeLeftPanel
);

export const getActiveRightPanel = createSelector(
  selectActiveRightPanel,
  (activeRightPanel) => activeRightPanel
);
