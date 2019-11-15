import { createSelector } from '@ngrx/store';
import * as MapInterfaces from './map.interfaces';
import { State } from '@app/app-reducer';

export const selectMapReady = (state: State) => state.map.ready;
export const selectMapSettingsLoaded = (state: State) => state.map.mapSettingsLoaded;

export const getReadyAndSettingsLoaded = createSelector(
  selectMapReady,
  selectMapSettingsLoaded,
  (ready: boolean, mapSettingsLoaded: boolean) => ({ ready, mapSettingsLoaded })
);
