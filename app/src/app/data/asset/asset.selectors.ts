import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './asset.interfaces';

export const getAssetState = createFeatureSelector<State>('asset');

export const getAssets = createSelector(
  getAssetState,
  (state: State) => {
    return Object.keys(state.assets).map(key => state.assets[key]);
  }
);

export const getCurrentAssetList = createSelector(
  getAssetState,
  (state: State) => {
    const currentList = state.assetLists[state.currentAssetList.listIdentifier];
    if(typeof currentList !== 'undefined') {
      return currentList.resultPages[state.currentAssetList.currentPage].map(key => state.assets[key]);
    }

    return [];
  }
);

export const getAssetMovements = createSelector(
  getAssetState,
  (state: State) => {
    let assetMovementKeys = Object.keys(state.assetMovements);
    if(state.filterQuery.length > 0) {
      state.filterQuery.map(query => {
        let columnName = 'assetName';
        if(['flagstate', 'ircs', 'cfr', 'vesselType', 'externalMarking', 'lengthOverAll'].indexOf(query.type) !== -1) {
          columnName = query.type;
        }
        assetMovementKeys = assetMovementKeys.filter(key => {
          if(typeof state.assetsEssentials[key] === 'undefined') {
            return false;
          }
          if(state.assetsEssentials[key][columnName] === null) {
            return false;
          }
          const valueToCheck = state.assetsEssentials[key][columnName].toLowerCase();
          if(query.inverse) {
            return query.values.reduce((acc, value) => {
              if(acc === false) {
                return acc;
              }
              return valueToCheck.indexOf(value.toLowerCase()) === -1;
            }, true);
          } else {
            return query.values.reduce((acc, value) => {
              if(acc === true) {
                return acc;
              }
              return valueToCheck.indexOf(value.toLowerCase()) !== -1;
            }, false);
          }
        });
      });
    }

    return assetMovementKeys.map(key => ({ assetMovement: state.assetMovements[key], assetEssentials: state.assetsEssentials[key] }));
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
    return state.assetMovements[state.selectedAsset];
  }
);

export const extendedDataForSelectedAsset = createSelector(
  getAssetState, getCurrentPositionOfSelectedAsset,
  (state: State, currentPosition) => {
    return {
      asset: state.assets[state.selectedAsset],
      assetTracks: state.assetTracks[state.selectedAsset],
      currentPosition
    };
  }
);

export const getForecasts = createSelector(
  getAssetState,
  (state: State) =>
    state.forecasts.reduce((acc, assetId) => {
      acc[assetId] = state.assetMovements[assetId];
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
    return Object.keys(state.assetsEssentials)
      .filter(key => state.assetsEssentials[key].assetName.toLowerCase().indexOf(state.searchQuery.toLowerCase()) !== -1)
      .map(key => ({ assetMovement: state.assetMovements[key], assetEssentials: state.assetsEssentials[key] }));
  }
);
