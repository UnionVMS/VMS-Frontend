import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './asset.reducer';

export const getAssetState = createFeatureSelector<State>('asset');

export const getAssets = createSelector(
  getAssetState,
  (state: State) => {
    return Object.keys(state.assets).map(key => state.assets[key]);
  }
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
