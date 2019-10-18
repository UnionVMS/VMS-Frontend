import { createSelector } from '@ngrx/store';
import * as MapInterfaces from './map.interfaces';
import { State } from '@app/app-reducer';

export const selectMapReady = (state: State) => state.map.ready;

export const getReady = createSelector(
  selectMapReady,
  (ready: boolean) => ready
);
