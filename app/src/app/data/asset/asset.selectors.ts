import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AssetInterfaces from './asset.interfaces';
import { State } from '@app/app-reducer';


export const getAssetState = createFeatureSelector<AssetInterfaces.State>('asset');

export const selectAssets = (state: State) => state.asset.assets;
export const selectAssetMovements = (state: State) => state.asset.assetMovements;
export const selectAssetForecasts = (state: State) => state.asset.forecasts;
export const selectAssetsEssentials = (state: State) => state.asset.assetsEssentials;
export const selectAssetsTracks = (state: State) => state.asset.assetTracks;
export const selectSelectedAsset = (state: State) => state.asset.selectedAsset;
export const selectFilterQuery = (state: State) => state.asset.filterQuery;
export const selectSearchQuery = (state: State) => state.asset.searchQuery;
export const selectPositionsForInspection = (state: State) => state.asset.positionsForInspection;


export const getAssets = createSelector(
  getAssetState,
  (state: AssetInterfaces.State) => {
    return Object.keys(state.assets).map(key => state.assets[key]);
  }
);

export const getNumberOfAssets = createSelector(
  getAssetState,
  (state: AssetInterfaces.State) => {
    return Object.keys(state.assets).length;
  }
);


export const getCurrentAssetList = createSelector(
  getAssetState,
  (state: AssetInterfaces.State) => {
    if(state.currentAssetList === null) {
      return [];
    }
    const currentList = state.assetLists[state.currentAssetList.listIdentifier];
    if(typeof currentList !== 'undefined') {
      return currentList.resultPages[state.currentAssetList.currentPage].map(key => state.assets[key]);
    }

    return [];
  }
);

export const getAssetMovements = createSelector(
  selectAssetMovements,
  selectAssetsEssentials,
  selectFilterQuery,
  (
    assetMovements: { [uid: string]: AssetInterfaces.AssetMovement },
    assetsEssentials: { [uid: string]: AssetInterfaces.AssetEssentialProperties },
    filterQuery: Array<AssetInterfaces.AssetFilterQuery>
  ) => {
    let assetMovementKeys = Object.keys(assetMovements);
    if(filterQuery.length > 0) {
      filterQuery.map(query => {
        let columnName = 'assetName';
        if(['flagstate', 'ircs', 'cfr', 'vesselType', 'externalMarking', 'lengthOverAll'].indexOf(query.type) !== -1) {
          columnName = query.type;
        }
        assetMovementKeys = assetMovementKeys.filter(key => {
          if(typeof assetsEssentials[key] === 'undefined') {
            return false;
          }
          if(assetsEssentials[key][columnName] === null) {
            return false;
          }

          if(query.isNumber) {

            return query.values.reduce((acc, value) => {
              if(acc === true) {
                return acc;
              }
              if(
                (value.operator === 'less then' && assetsEssentials[key][columnName] < value.value) ||
                (value.operator === 'greater then' && assetsEssentials[key][columnName] > value.value) ||
                (value.operator === 'almost equal' && Math.floor(assetsEssentials[key][columnName]) === Math.floor(value.value)) ||
                (value.operator === 'equal' && assetsEssentials[key][columnName] === value.value)
              ) {
                return true;
              } else {
                return false;
              }
            }, false);


          } else {
            const valueToCheck = assetsEssentials[key][columnName].toLowerCase();
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
          }
        });
      });
    }
    return assetMovementKeys.map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] }));
  }
);

export const getAssetTracks = createSelector(
  selectAssetsTracks,
  (assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack }) => Object.keys(assetTracks).map(key => assetTracks[key])
);

export const getVisibleAssetTracks = createSelector(
  selectAssetsTracks,
  (assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack }) => Object.keys(assetTracks).map(key => assetTracks[key])
);

export const getCurrentPositionOfSelectedAsset = createSelector(
  selectAssetMovements,
  selectSelectedAsset,
  (assetMovements: { [uid: string]: AssetInterfaces.AssetMovement }, selectedAsset: string) => {
    return assetMovements[selectedAsset];
  }
);

export const extendedDataForSelectedAsset = createSelector(
  selectAssets,
  selectSelectedAsset,
  selectAssetsTracks,
  getCurrentPositionOfSelectedAsset,
  (
    assets: { [uid: string]: AssetInterfaces.Asset },
    selectedAsset: string,
    assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack },
    currentPosition
  ) => {
    return {
      asset: assets[selectedAsset],
      assetTracks: assetTracks[selectedAsset],
      currentPosition
    };
  }
);

export const getForecasts = createSelector(
  selectAssetForecasts,
  selectAssetMovements,
  (assetForecasts, assetMovements) =>
    assetForecasts.reduce((acc, assetId) => {
      acc[assetId] = assetMovements[assetId];
      return acc;
    }, {})
);

export const getPositionsForInspection = createSelector(
  selectPositionsForInspection,
  (positionsForInspection) => positionsForInspection
);

export const getSearchAutocomplete = createSelector(
  selectSearchQuery,
  selectAssetsEssentials,
  selectAssetMovements,
  (searchQuery, assetsEssentials, assetMovements) => {
    if(searchQuery.length < 2) {
      return [];
    }
    return Object.keys(assetsEssentials)
      .filter(key =>
        assetsEssentials[key] !== undefined &&
        assetsEssentials[key].assetName !== null &&
        assetsEssentials[key].assetName.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      )
      .map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] }));
  }
);
