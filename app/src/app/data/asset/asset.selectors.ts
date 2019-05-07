import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './asset.interfaces';

export const getAssetState = createFeatureSelector<State>('asset');

export const getAssets = createSelector(
  getAssetState,
  (state: State) => Object.keys(state.assets)
    .filter(key => state.assets[key].assetName.toLowerCase().indexOf(state.filterQuery.toLowerCase()) !== -1)
    .map(key => state.assets[key])
);

export const getAssetTracks = createSelector(
  getAssetState,
  (state: State) => Object.keys(state.assetTracks).map(key => state.assetTracks[key])
);

export const getVisibleAssetTracks = createSelector(
  getAssetState,
  (state: State) => Object.keys(state.assetTracks).map(key => state.assetTracks[key])
);

export const getCurrentPositionOfSelectedAsset = createSelector(
  getAssetState,
  (state: State) => {
    return state.assets[state.selectedAsset];
  }
);

export const extendedDataForSelectedAsset = createSelector(
  getAssetState, getCurrentPositionOfSelectedAsset,
  (state: State, currentPosition) => {
    return {
      fullAsset: state.fullAssets[state.selectedAsset],
      assetTracks: state.assetTracks[state.selectedAsset],
      currentPosition
    };
  }
);

export const getForecasts = createSelector(
  getAssetState,
  (state: State) =>
    state.forecasts.reduce((acc, assetId) => {
      acc[assetId] = state.assets[assetId];
      return acc;
    }, {})
);

export const getPositionsForInspection = createSelector(
  getAssetState,
  (state: State) => state.positionsForInspection
);

export const getSearchAutocomplete = createSelector(
  getAssetState,
  (state: State) => {
    if(state.searchQuery.length < 2) {
      return [];
    }

    return Object.keys(state.assets)
      .filter(key => state.assets[key].assetName.toLowerCase().indexOf(state.searchQuery.toLowerCase()) !== -1)
      .map(key => state.assets[key]);
  }
);
