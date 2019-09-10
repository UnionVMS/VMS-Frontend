import { createAction, props } from '@ngrx/store';
import { MapLayer } from './map-layers.interfaces';

export const getAreas = createAction(
  '[Map Layers] Get areas'
);

export const setAreas = createAction(
  '[Map Layers] Set areas',
  props<{ mapLayers: Array<MapLayer> }>()
);

export const addActiveLayer = createAction(
  '[Map Layers] Add layer',
  props<{ layerName: string }>()
);

export const removeActiveLayer = createAction(
  '[Map Layers] Remove layer',
  props<{ layerName: string }>()
);
