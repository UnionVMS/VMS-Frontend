import { on, createReducer } from '@ngrx/store';
import * as MapLayersActions from './map-layers.actions';
import * as Types from './map-layers.types';

export const initialState: Types.State = {
  mapLayers: {},
  cascadedLayers: {},
  activeLayers: []
};

export const mapLayersReducer = createReducer(initialState,
  on(MapLayersActions.addAreas, (state, { mapLayers }) => {
    return ({
      ...state,
      mapLayers: {
        ...state.mapLayers,
        ...mapLayers
      }
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
  on(MapLayersActions.addCascadedLayers, (state, { cascadedLayers }) => {
    return ({
      ...state,
      cascadedLayers: {
        ...state.cascadedLayers,
        ...cascadedLayers
      }
    });
  }),
);
