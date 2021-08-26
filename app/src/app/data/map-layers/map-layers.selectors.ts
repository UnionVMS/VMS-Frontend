import { createSelector } from '@ngrx/store';
import * as MapLayersInterface from './map-layers.types';
import { State } from '@app/app-reducer';

export const selectMapLayers = (state: State) => state.mapLayers.mapLayers;
export const selectCascadedLayers = (state: State) => state.mapLayers.cascadedLayers;
export const selectActiveLayers = (state: State) => state.mapLayers.activeLayers;

export const getMapLayers = createSelector(
  selectMapLayers,
  (mapLayers: Readonly<{ readonly [typeName: string]: MapLayersInterface.MapLayer }>) => {
    return Object.values(mapLayers);
  }
);

export const getCascadedLayers = createSelector(
  selectCascadedLayers,
  (cascadedLayers: Readonly<{ readonly [name: string]: MapLayersInterface.CascadedLayer }>) => {
    return Object.values(cascadedLayers);
  }
);

export const getActiveLayers = createSelector(
  selectActiveLayers,
  (activeLayers: Array<string>) => {
    return [ ...activeLayers ];
  }
);
