import { createSelector } from '@ngrx/store';
import * as MapLayersInterface from './map-layers.types';
import { State } from '@app/app-reducer';

export const selectMapLayers = (state: State) => state.mapLayers.mapLayers;
export const selectActiveLayers = (state: State) => state.mapLayers.activeLayers;

export const getMapLayers = createSelector(
  selectMapLayers,
  (mapLayers: Readonly<{ readonly [typeName: string]: MapLayersInterface.MapLayer }>) => {
    return Object.values(mapLayers);
  }
);

export const getActiveLayers = createSelector(
  selectActiveLayers,
  (activeLayers: Array<string>) => {
    return [ ...activeLayers ];
  }
);
