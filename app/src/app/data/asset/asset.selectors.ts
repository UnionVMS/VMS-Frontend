import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './asset.interfaces';

export const getAssetState = createFeatureSelector<State>('asset');

export const getAssets = createSelector(
  getAssetState,
  (state: State) => {
    let assetMovementKeys = Object.keys(state.assetMovements);
    if(state.filterQuery.length > 0) {
      state.filterQuery.map(query => {
        let columnName = 'assetName';
        if(query.type === 'flagstate') {
          columnName = 'flagstate';
        }
        assetMovementKeys = assetMovementKeys.filter(key => {
          const valueToCheck = state.assetMovements[key][columnName].toLowerCase();
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

    return assetMovementKeys.map(key => state.assetMovements[key]);

    // // If filterQuery starts with !, invert the search.
    // if(state.filterQuery.indexOf('!') === 0) {
    //   const filterQuery = state.filterQuery.substring(1);
    //   return Object.keys(state.assetMovements)
    //     .filter(key => state.assetMovements[key].assetName.toLowerCase().indexOf(filterQuery.toLowerCase()) === -1)
    //     .map(key => state.assetMovements[key]);
    // }
    // return Object.keys(state.assetMovements)
    //   .filter(key => state.assetMovements[key].assetName.toLowerCase().indexOf(state.filterQuery.toLowerCase()) !== -1)
    //   .map(key => state.assetMovements[key]);
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
    return Object.keys(state.assetMovements)
      .filter(key => state.assetMovements[key].assetName.toLowerCase().indexOf(state.searchQuery.toLowerCase()) !== -1)
      .map(key => state.assetMovements[key]);
  }
);
