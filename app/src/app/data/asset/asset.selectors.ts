import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AssetTypes from './asset.types';
import { State } from '@app/app-reducer';
import { MapSavedFiltersSelectors, MapSavedFiltersTypes } from '@data/map-saved-filters';
import { IncidentTypes, IncidentSelectors } from '@data/incident';
import { MapSelectors } from '@data/map';
import { getMergedRoute } from '@data/router/router.selectors';


export const getAssetState = createFeatureSelector<AssetTypes.State>('asset');

export const selectAssets = (state: State) => state.asset.assets;
export const selectAssetMovements = (state: State) => state.asset.assetMovements;
export const selectAssetForecasts = (state: State) => state.asset.forecasts;
export const selectAssetsEssentials = (state: State) => state.asset.assetsEssentials;
export const selectAssetsLists = (state: State) => state.asset.assetLists;
export const selectAssetsTracks = (state: State) => state.asset.assetTracks;
export const selectAssetTrips = (state: State) => state.asset.assetTrips;
export const selectAssetTripGranularity = (state: State) => state.asset.assetTripGranularity;
export const selectAssetTripTimestamp = (state: State) => state.asset.assetTripTimestamp;
export const selectCurrentAssetList = (state: State) => state.asset.currentAssetList;
export const selectLastUserAssetSearch = (state: State) => state.asset.lastUserAssetSearch;
export const selectSelectedAssets = (state: State) => state.asset.selectedAssets;
export const selectSelectedAsset = (state: State) => state.asset.selectedAsset;
export const selectLastFullPositions = (state: State) => state.asset.lastFullPositions;
export const selectFilterQuery = (state: State) => state.asset.filterQuery;
export const selectSearchQuery = (state: State) => state.asset.searchQuery;
export const selectPositionsForInspection = (state: State) => state.asset.positionsForInspection;
export const selectUnitTonnages = (state: State) => state.asset.unitTonnages;
export const selectSelectedAssetsLastPositions = (state: State) => state.asset.selectedAssetsLastPositions;
export const selectAssetLicences = (state: State) => state.asset.assetLicences;


export const getAssetsMovementsDependingOnLeftPanel = createSelector(
  selectAssetMovements,
  MapSelectors.getFiltersActive,
  MapSelectors.getActiveLeftPanel,
  IncidentSelectors.selectIncidents,
  IncidentSelectors.selectIncidentsByTypeAndStatus,
  (
    assetMovements: { readonly [uid: string]: AssetTypes.AssetMovement },
    filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>,
    activeLeftPanel: ReadonlyArray<string>,
    incidents: IncidentTypes.Incident,
    incidentsByTypeAndStatus: IncidentTypes.IncidentIdsByTypeAndStatus
  ) => {
    if(activeLeftPanel[0] === 'workflows') {
      if(IncidentTypes.IncidentTypesValues.includes(activeLeftPanel[1])) {
        const statusName = (activeLeftPanel[2] === 'RESOLVED' ? 'recentlyResolvedIncidentIds' : 'unresolvedIncidentIds');
        return incidentsByTypeAndStatus[IncidentTypes.IncidentTypesInverted[activeLeftPanel[1]]][statusName].reduce(
          (acc, incidentId) => {
            const incident = incidents[incidentId];
            acc[incident.assetId] = {
              microMove: incident.lastKnownLocation,
              asset: incident.assetId
            };
            return acc;
          }, {}
        );
      }
    }
    return assetMovements;
  }
);

export const getAssets = createSelector(
  getAssetState,
  (state: AssetTypes.State) => {
    return Object.values(state.assets);
  }
);

export const getNumberOfAssets = createSelector(
  getAssetState,
  (state: AssetTypes.State) => {
    return Object.keys(state.assets).length;
  }
);

export const getCurrentAssetList = createSelector(
  selectAssetsLists,
  selectCurrentAssetList,
  selectAssets,
  (
    assetsLists: { readonly [identifier: string]: AssetTypes.AssetList },
    currentAssetList: string,
    assets: { [uid: string]: AssetTypes.Asset },
  ): ReadonlyArray<AssetTypes.Asset> => {
    if(currentAssetList === null) {
      return [];
    }
    const currentList = assetsLists[currentAssetList];
    if(typeof currentList !== 'undefined') {
      return currentList.assets.map(key => assets[key]);
    }

    return [];
  }
);

export const getCurrentAssetListSearchQuery = createSelector(
  selectAssetsLists,
  selectCurrentAssetList,
  selectAssets,
  (
    assetsLists: { readonly [identifier: string]: AssetTypes.AssetList },
    currentAssetList: string,
    assets: { [uid: string]: AssetTypes.Asset },
  ): AssetTypes.AssetListSearchQuery|null => {
    if(currentAssetList === null) {
      return null;
    }
    const currentList = assetsLists[currentAssetList];
    if(typeof currentList !== 'undefined') {
      return currentList.searchQuery;
    }

    return null;
  }
);

export const getLastUserAssetSearch = createSelector(
  selectLastUserAssetSearch,
  (lastUserAssetSearch: string) => lastUserAssetSearch
);

export const getAssetsEssentials = createSelector(
  selectAssetsEssentials,
  (assetsEssentials) => assetsEssentials
);

export const getAssetEssentialsForAssetGroups = createSelector(
  selectAssetsEssentials,
  MapSavedFiltersSelectors.getAssetGroupFilters,
  (assetEssentials, assetGroupFilters) => {
    const assetIds = [ ...new Set(assetGroupFilters.reduce((acc: ReadonlyArray<string>, assetGroupFilter) => {
      const filter = assetGroupFilter.filter.find(f => f.type === 'GUID');
      return [ ...acc, ...filter.values ];
    }, []))];
    return assetIds.reduce((acc, id) => {
      if(assetEssentials[id] !== undefined) {
        return { ...acc, [id]: assetEssentials[id]};
      }
      return acc;
    }, {});
  }
);

export const getAssetMovements = createSelector(
  getAssetsMovementsDependingOnLeftPanel,
  selectAssetsEssentials,
  selectFilterQuery,
  MapSavedFiltersSelectors.getActiveFilters,
  MapSelectors.getFiltersActive,
  MapSelectors.getActiveLeftPanel,
  (
    assetMovements: { readonly [uid: string]: AssetTypes.AssetMovement },
    assetsEssentials: { readonly [uid: string]: AssetTypes.AssetEssentialProperties },
    currentFilterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>,
    savedFilterQuerys: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>,
    filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>,
    activeLeftPanel: ReadonlyArray<string>
  ) => {
    let assetMovementKeys = Object.keys(assetMovements);

    if(activeLeftPanel[0] === 'filters') {
      let filterQuerys: ReadonlyArray<ReadonlyArray<AssetTypes.AssetFilterQuery>> = [];
      if(filtersActive.savedFilters) {
        filterQuerys = savedFilterQuerys.map(savedFilter => savedFilter.filter);
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
            } else if(query.type === 'GUID') {
              columnName = 'assetId';
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
                if(typeof assetsEssentials[key][columnName] === 'undefined') {
                  return false;
                }
                const valueToCheck = assetsEssentials[key][columnName].toLowerCase();
                if(query.inverse) {
                  return query.values.some(value => valueToCheck.indexOf(value.toLowerCase()) === -1);
                } else {
                  return query.values.some(value => valueToCheck.indexOf(value.toLowerCase()) !== -1);
                }
              }
            });
          });
        }
      });

      // if(filtersActive.assetGroups && selectedAssetGroups.length > 0) {
      //   // Filter on selected assetGroups
      //   const selectedAssetIds = selectedAssetGroups.reduce((acc, assetGroup) => {
      //     assetGroup.assetGroupFields.map(assetField => {
      //       if(acc.indexOf(assetField.value) === -1) {
      //         acc.push(assetField.value);
      //       }
      //     });
      //     return acc;
      //   }, []);
      //   assetMovementKeys = assetMovementKeys.filter(key => selectedAssetIds.indexOf(key) !== -1);
      // }
    }
    return assetMovementKeys.map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] }));
  }
);

export const getAssetTracks = createSelector(
  selectAssetsTracks,
  (assetTracks: { [assetId: string]: AssetTypes.AssetTrack }) => Object.values(assetTracks)
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
  (assetTracks: { [assetId: string]: AssetTypes.AssetTrack }) => Object.values(assetTracks)
);

export const getCurrentPositionOfSelectedAssets = createSelector(
  getAssetsMovementsDependingOnLeftPanel,
  selectSelectedAssets,
  (assetMovements: { [uid: string]: AssetTypes.AssetMovement }, selectedAssets: Array<string>) =>
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
    assets: { [uid: string]: AssetTypes.Asset },
    selectedAssets: Array<string>,
    selectedAsset: string|null,
    assetTracks: { [assetId: string]: AssetTypes.AssetTrack },
    currentPositions
  ): Array<AssetTypes.AssetData> => selectedAssets.reduce((acc, assetId) => {
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
        assetsEssentials[key].assetName !== undefined &&
        searchQuery !== undefined &&
        assetsEssentials[key].assetName.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      )
      .map(key => ({ assetMovement: assetMovements[key], assetEssentials: assetsEssentials[key] } as Readonly<{
        assetMovement: AssetTypes.AssetMovement,
        assetEssentials: AssetTypes.AssetEssentialProperties
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

export const getLastFullPositionsForUrlAsset = createSelector(
  selectLastFullPositions, getSelectedAsset,
  (fullPositions: { [assetId: string]: ReadonlyArray<AssetTypes.FullMovement> }, asset: AssetTypes.Asset) =>
    typeof asset !== 'undefined' ? fullPositions[asset.id] : undefined
);

export const getLastFullPositionsForSelectedAsset = createSelector(
  selectLastFullPositions, selectSelectedAsset,
  (fullPositions: { [assetId: string]: ReadonlyArray<AssetTypes.FullMovement> }, assetId: string | null) =>
    typeof assetId !== 'undefined' && assetId !== null ? fullPositions[assetId] : undefined
);


export const getSelectedAssetsLastPositions = createSelector(
  selectSelectedAssetsLastPositions,
  (selectedAssetsLastPositions) => selectedAssetsLastPositions
);

export const getLicenceForSelectedMapAsset = createSelector(
  selectAssetLicences,
  selectSelectedAsset,
  (assetLicences, selectedAssetId) => {
    if(selectedAssetId === null) {
      return null;
    }
    return assetLicences[selectedAssetId];
  }
);

export const getLicenceForSelectedAsset = createSelector(
  selectAssetLicences,
  getSelectedAsset,
  (assetLicences, selectedAssetUrl) => {
    if(typeof selectedAssetUrl === 'undefined' || typeof selectedAssetUrl.id === 'undefined') {
      return null;
    }
    return assetLicences[selectedAssetUrl.id];
  }
);
