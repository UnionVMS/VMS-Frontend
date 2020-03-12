import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AssetInterfaces from './asset.interfaces';
import { State } from '@app/app-reducer';
import { MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { IncidentInterfaces, IncidentSelectors } from '@data/incident';
import { MapSelectors } from '@data/map';
import { getMergedRoute } from '@data/router/router.selectors';


export const getAssetState = createFeatureSelector<AssetInterfaces.State>('asset');

export const selectAssets = (state: State) => state.asset.assets;
export const selectAssetMovements = (state: State) => state.asset.assetMovements;
export const selectAssetForecasts = (state: State) => state.asset.forecasts;
export const selectAssetsEssentials = (state: State) => state.asset.assetsEssentials;
export const selectAssetGroups = (state: State) => state.asset.assetGroups;
export const selectAssetsTracks = (state: State) => state.asset.assetTracks;
export const selectAssetTrips = (state: State) => state.asset.assetTrips;
export const selectAssetTripGranularity = (state: State) => state.asset.assetTripGranularity;
export const selectAssetTripTimestamp = (state: State) => state.asset.assetTripTimestamp;
export const selectSelectedAssets = (state: State) => state.asset.selectedAssets;
export const selectSelectedAsset = (state: State) => state.asset.selectedAsset;
export const selectFilterQuery = (state: State) => state.asset.filterQuery;
export const selectSearchQuery = (state: State) => state.asset.searchQuery;
export const selectPositionsForInspection = (state: State) => state.asset.positionsForInspection;
export const selectSelectedAssetGroups = (state: State) => state.asset.selectedAssetGroups;
export const selectUnitTonnages = (state: State) => state.asset.unitTonnages;


export const getAssetsMovementsDependingOnLeftPanel = createSelector(
  selectAssetMovements,
  MapSelectors.getFiltersActive,
  MapSelectors.getActiveLeftPanel,
  IncidentSelectors.selectAssetNotSendingIncidents,
  (
    assetMovements: { readonly [uid: string]: AssetInterfaces.AssetMovement },
    filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>,
    activeLeftPanel: string,
    assetsNotSendingIncicents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident }
  ) => {
    if(activeLeftPanel === 'workflows') {
      if(filtersActive.assetsNotSendingIncicents) {
        return Object.keys(assetsNotSendingIncicents).reduce((acc, assetId) => {
          acc[assetId] = {
            microMove: assetsNotSendingIncicents[assetId].lastKnownLocation,
            asset: assetId
          };
          return acc;
        }, {});
      }
    }
    return assetMovements;
  }
);

export const getAssets = createSelector(
  getAssetState,
  (state: AssetInterfaces.State) => {
    return Object.values(state.assets);
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

export const getAssetsEssentials = createSelector(
  selectAssetsEssentials,
  (assetsEssentials) => assetsEssentials
);

export const getAssetGroups = createSelector(
  selectAssetGroups,
  (assetGroups) => assetGroups
);

export const getSelectedAssetGroups = createSelector(
  selectSelectedAssetGroups,
  (assetGroups) => assetGroups
);

export const getAssetMovements = createSelector(
  getAssetsMovementsDependingOnLeftPanel,
  selectAssetsEssentials,
  selectFilterQuery,
  MapSavedFiltersSelectors.getActiveFilters,
  selectSelectedAssetGroups,
  MapSelectors.getFiltersActive,
  MapSelectors.getActiveLeftPanel,
  IncidentSelectors.selectAssetNotSendingIncidents,
  (
    assetMovements: { readonly [uid: string]: AssetInterfaces.AssetMovement },
    assetsEssentials: { readonly [uid: string]: AssetInterfaces.AssetEssentialProperties },
    currentFilterQuery: ReadonlyArray<AssetInterfaces.AssetFilterQuery>,
    savedFilterQuerys: ReadonlyArray<ReadonlyArray<AssetInterfaces.AssetFilterQuery>>,
    selectedAssetGroups: ReadonlyArray<AssetInterfaces.AssetGroup>,
    filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>,
    activeLeftPanel: string,
    assetsNotSendingIncicents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident }
  ) => {
    let assetMovementKeys = Object.keys(assetMovements);

    if(activeLeftPanel === 'filters') {
      let filterQuerys: ReadonlyArray<ReadonlyArray<AssetInterfaces.AssetFilterQuery>> = [];
      if(filtersActive.savedFilters) {
        filterQuerys = [ ...savedFilterQuerys ];
      }

      if(filtersActive.filter) {
        filterQuerys = [ ...filterQuerys, currentFilterQuery ];
      }

      filterQuerys.map((filterQuery) => {
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
      });

      if(filtersActive.assetGroups && selectedAssetGroups.length > 0) {
        // Filter on selected assetGroups
        const selectedAssetIds = selectedAssetGroups.reduce((acc, assetGroup) => {
          assetGroup.assetGroupFields.map(assetField => {
            if(acc.indexOf(assetField.value) === -1) {
              acc.push(assetField.value);
            }
          });
          return acc;
        }, []);
        assetMovementKeys = assetMovementKeys.filter(key => selectedAssetIds.indexOf(key) !== -1);
      }
    }
    return assetMovementKeys.map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] }));
  }
);

export const getAssetTracks = createSelector(
  selectAssetsTracks,
  (assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack }) => Object.values(assetTracks)
);

export const getTripTimestamp = createSelector(
  selectAssetTripTimestamp,
  (assetTripTimestamp) => assetTripTimestamp
);

export const getTripGranularity = createSelector(
  selectAssetTripGranularity,
  (assetTripGranularity) => assetTripGranularity
);

export const getTripTimestamps = createSelector(
  selectAssetTrips,
  (assetTrips) => Object.keys(assetTrips).map(timestamp => parseInt(timestamp, 10))
);

export const getVisibleAssetTracks = createSelector(
  selectAssetsTracks,
  (assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack }) => Object.values(assetTracks)
);

export const getCurrentPositionOfSelectedAssets = createSelector(
  getAssetsMovementsDependingOnLeftPanel,
  selectSelectedAssets,
  (assetMovements: { [uid: string]: AssetInterfaces.AssetMovement }, selectedAssets: Array<string>) =>
    selectedAssets.reduce((acc, selectedAsset) => {
      acc[selectedAsset] = assetMovements[selectedAsset];
      return acc;
    }, {})
);

export const extendedDataForSelectedAssets = createSelector(
  selectAssets,
  selectSelectedAssets,
  selectSelectedAsset,
  selectAssetsTracks,
  getCurrentPositionOfSelectedAssets,
  (
    assets: { [uid: string]: AssetInterfaces.Asset },
    selectedAssets: Array<string>,
    selectedAsset: string|null,
    assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack },
    currentPositions
  ): Array<AssetInterfaces.AssetData> => selectedAssets.reduce((acc, assetId) => {
    if(assets[assetId] !== undefined) {
      acc.push({
        asset: assets[assetId],
        assetTracks: assetTracks[assetId],
        currentPosition: currentPositions[assetId],
        currentlyShowing: selectedAsset === assetId
      });
    }
    return acc;
  }, [])
);

export const getForecasts = createSelector(
  selectAssetForecasts,
  selectAssetMovements,
  (assetForecasts, assetMovements) => {
    return assetForecasts.reduce((acc, assetId) => {
      acc[assetId] = assetMovements[assetId];
      return acc;
    }, {});
  }
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
      .map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] } as Readonly<{
        assetMovement: AssetInterfaces.AssetMovement,
        assetEssentials: AssetInterfaces.AssetEssentialProperties
      }>));
  }
);

export const getUnitTonnages = createSelector(
  selectUnitTonnages,
  (unitTonnages) => unitTonnages
);

export const getSelectedAsset = createSelector(
  selectAssets,
  getMergedRoute,
  (assets, mergedRoute) => {
    if(typeof assets[mergedRoute.params.assetId] !== 'undefined') {
      return assets[mergedRoute.params.assetId];
    }
    return undefined;
  }
);

export const getAssetTracksForSelectedAsset = createSelector(
  selectAssetsTracks, getSelectedAsset,
  (assetTracks: { [assetId: string]: AssetInterfaces.AssetTrack }, asset: AssetInterfaces.Asset) =>
    typeof asset !== 'undefined' ? assetTracks[asset.id] : undefined
);
