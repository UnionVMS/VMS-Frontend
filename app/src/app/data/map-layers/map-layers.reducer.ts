import { on, createReducer } from '@ngrx/store';
import * as MapLayersActions from './map-layers.actions';
import * as Interfaces from './map-layers.types';

export const initialState: Interfaces.State = {
  mapLayers: [],
  activeLayers: []
};

export const mapLayersReducer = createReducer(initialState,
  on(MapLayersActions.addAreas, (state, { mapLayers }) => {
    console.warn(state.mapLayers, mapLayers);
    return ({
    ...state,
    mapLayers: [
      ...state.mapLayers,
      ...mapLayers
    ]
    });
  }),
  on(MapLayersActions.setAreas, (state, { mapLayers }) => ({
    ...state,
    mapLayers
  })),
  on(MapLayersActions.addActiveLayer, (state, { layerName }) => ({
    ...state,
    activeLayers: [
      ...state.activeLayers,
      layerName
    ].filter((name, index, activeLayers) => activeLayers.indexOf(name) === index)
  })),
  on(MapLayersActions.removeActiveLayer, (state, { layerName }) => ({
    ...state,
    activeLayers: state.activeLayers.filter(currentLayerName => currentLayerName !== layerName)
  })),
);
