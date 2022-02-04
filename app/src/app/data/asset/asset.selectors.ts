import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as AssetTypes from './asset.types';
import { State } from '@app/app-reducer';
import { MapSavedFiltersSelectors, MapSavedFiltersTypes } from '@data/map-saved-filters';
import { IncidentTypes, IncidentSelectors } from '@data/incident';
import { ActivityTypes, ActivitySelectors } from '@data/activity';
import { MapSelectors } from '@data/map';
import { getMergedRoute } from '@data/router/router.selectors';


export const getAssetState = createFeatureSelector<AssetTypes.State>('asset');

export const selectAssets = (state: State) => state.asset.assets;
export const selectAssetMovements = (state: State) => state.asset.assetMovements;
export const selectAssetForecasts = (state: State) => state.asset.forecasts;
export const selectAssetsLists = (state: State) => state.asset.assetLists;
export const selectAssetsTracks = (state: State) => state.asset.assetTracks;
export const selectAssetTrips = (state: State) => state.asset.assetTrips;
export const selectAssetTripGranularity = (state: State) => state.asset.assetTripGranularity;
export const selectAssetTripTimestamp = (state: State) => state.asset.assetTripTimestamp;
export const selectCurrentAssetList = (state: State) => state.asset.currentAssetList;
export const selectLastUserAssetSearch = (state: State) => state.asset.lastUserAssetSearch;
export const selectSelectedAssets = (state: State) => state.asset.selectedAssets;
export const selectSelectedAsset = (state: State) => state.asset.selectedAsset;
export const selectSelectedMovement = (state: State) => state.asset.selectedMovement;
export const selectLastFullPositions = (state: State) => state.asset.lastFullPositions;
export const selectLastPollsForAsset = (state: State) => state.asset.lastPollsForAsset;
export const selectFilterQuery = (state: State) => state.asset.filterQuery;
export const selectSearchQuery = (state: State) => state.asset.searchQuery;
export const selectPositionsForInspection = (state: State) => state.asset.positionsForInspection;
export const selectUnitTonnages = (state: State) => state.asset.unitTonnages;
export const selectSelectedAssetsLastPositions = (state: State) => state.asset.selectedAssetsLastPositions;
export const selectAssetLicences = (state: State) => state.asset.assetLicences;
export const selectNumberOfVMSAssetsInSystem = (state: State) => state.asset.numberOfVMSAssetsInSystem;


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
          (acc: AssetTypes.AssetMovement, incidentId: string): AssetTypes.AssetMovement => {
            const incident = incidents[incidentId];
            acc[incident.assetId] = {
              movement: incident.lastKnownLocation,
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
    return state.assets;
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

export const getAssetsForAssetGroups = createSelector(
  selectAssets,
  MapSavedFiltersSelectors.getAssetGroupFilters,
  (assets, assetGroupFilters) => {
    const assetIds = [ ...new Set(assetGroupFilters.reduce((acc: ReadonlyArray<string>, assetGroupFilter) => {
      const filter = assetGroupFilter.filter.find(f => f.type === 'GUID');
      return [ ...acc, ...filter.values ];
    }, []))];
    return assetIds.reduce((acc, id) => {
      if(assets[id] !== undefined) {
        return { ...acc, [id]: assets[id]};
      }
      return acc;
    }, {});
  }
);

export const getAssetMovements = createSelector(
  getAssetsMovementsDependingOnLeftPanel,
  selectAssets,
  selectFilterQuery,
  MapSavedFiltersSelectors.getActiveFilters,
  MapSelectors.getFiltersActive,
  MapSelectors.getActiveLeftPanel,
  ActivitySelectors.getLatestActivities,
  (
    assetMovements: { readonly [uid: string]: AssetTypes.AssetMovement },
    assets: { readonly [uid: string]: AssetTypes.Asset },
    currentFilterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>,
    savedFilterQuerys: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>,
    filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>,
    activeLeftPanel: ReadonlyArray<string>,
    activities: { readonly [uid: string]: ActivityTypes.Activity },
  ) => {
    let assetMovementKeys = Object.keys(assetMovements);

    if(activeLeftPanel[0] === 'filters' || activeLeftPanel[0] === 'tracks') {
      let filterQuerys: ReadonlyArray<ReadonlyArray<AssetTypes.AssetFilterQuery>> = [];
      if(filtersActive.savedFilters) {
        filterQuerys = savedFilterQuerys.filter((filter) => filter.filter[0].type !== 'GUID').map(savedFilter => savedFilter.filter);
      }

      if(filtersActive.assetGroups) {
        filterQuerys = [
          ...filterQuerys,
          ...savedFilterQuerys.filter((filter) => filter.filter[0].type === 'GUID').map(savedFilter => savedFilter.filter)
        ];
      }

      if(filtersActive.filter) {
        filterQuerys = [ ...filterQuerys, currentFilterQuery ];
      }

      filterQuerys.map((filterQuery) => {
        if(filterQuery.length > 0) {
          filterQuery.map(query => {
            let columnName = 'name';
            if(['flagStateCode', 'ircs', 'cfr', 'vesselType', 'externalMarking', 'lengthOverAll', 'hasLicence', 'mobileTerminalIds'].indexOf(query.type) !== -1) {
              columnName = query.type;
            } else if(query.type === 'GUID') {
              columnName = 'id';
            }
            assetMovementKeys = assetMovementKeys.filter(key => {
              if(
                typeof assets[key] === 'undefined' ||
                assets[key][columnName] === null ||
                typeof assets[key][columnName] === 'undefined'
              ) {
                return false;
              }
              if( assets[key]['mobileTerminalIds'] && assets[key]['mobileTerminalIds'][0] !== null
              && assets[key]['mobileTerminalIds'].length > 0 && query.type === 'mobileTerminals' && query.values[0] === true){
                return true;
              }
              if( !assets[key]['mobileTerminalIds'] && query.type === 'mobileTerminals' && query.values[0] === false){
                return true;
              }
              if (query.type === 'activity') {
                if (typeof activities[key] === 'undefined') {
                  return false;
                } else {
                  const valueToCheck = activities[key]['activityType'].toLowerCase();
                  if(query.inverse) {
                    return query.values.some(value => valueToCheck.indexOf(value.toLowerCase()) === -1);
                  } else {
                    return query.values.some(value => valueToCheck.indexOf(value.toLowerCase()) !== -1);
                  }
                }
              }
              if(query.valueType === AssetTypes.AssetFilterValueTypes.NUMBER) {
                return query.values.reduce((acc, value) => {
                  if(acc === true) {
                    return acc;
                  }
                  if(
                    (value.operator === 'less than' && assets[key][columnName] < value.value) ||
                    (value.operator === 'greater than' && assets[key][columnName] > value.value) ||
                    (value.operator === 'almost equal' && Math.floor(assets[key][columnName]) === Math.floor(value.value)) ||
                    (value.operator === 'equal' && assets[key][columnName] === value.value) ||
                    (value.operator === 'less than or equal' && assets[key][columnName] <= value.value) ||
                    (value.operator === 'greater than or equal' && assets[key][columnName] >= value.value)
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                }, false);
              } else if(query.valueType === AssetTypes.AssetFilterValueTypes.BOOLEAN) {
                if(query.inverse) {
                  return query.values.some(value => assets[key][columnName] !== value);
                } else {
                  return query.values.some(value => assets[key][columnName] === value);
                }
              } else {
                const valueToCheck = assets[key][columnName].toLowerCase();
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
    }
    return assetMovementKeys.map(key => ({ assetMovement: assetMovements[key], asset: assets[key] }));
  }
);

export const getMapStatistics = createSelector(
  getAssetMovements,
  getAssetsMovementsDependingOnLeftPanel,
  selectAssets,
  IncidentSelectors.getUrgentByType,
  selectNumberOfVMSAssetsInSystem,
  (
    assetMovements,
    onMapDepndingOnLeftPanel: { readonly [uid: string]: AssetTypes.AssetMovement },
    assets: { readonly [uid: string]: AssetTypes.Asset },
    urgentByType: IncidentTypes.UrgentByType,
    numberOfVMSAssetsInSystem: number
  ) => {
    const sweVMSAssetsOnMapStatistics = Object.keys(onMapDepndingOnLeftPanel).reduce((acc, assetId) => {
      const currentAsset = assets[assetId];
      if(currentAsset && currentAsset.mobileTerminalIds && currentAsset.mobileTerminalIds.length > 0
        && currentAsset.mobileTerminalIds[0] !== null) {
        return {
          ...acc,
          count: acc.count + 1,
          licenceInfo: {
            valid: currentAsset.hasLicence ? acc.licenceInfo.valid + 1 : acc.licenceInfo.valid,
            missing: !currentAsset.hasLicence ? acc.licenceInfo.missing + 1 : acc.licenceInfo.missing,
          }
        };
      }
      return acc;
    }, { count: 0, licenceInfo: { valid: 0, missing: 0 } });

    return {
      assetFilter: {
        showing: assetMovements.length,
        total: Object.keys(onMapDepndingOnLeftPanel).length
      },
      sweVMS: {
        sending: sweVMSAssetsOnMapStatistics.count,
        total: numberOfVMSAssetsInSystem,
      },
      licenceInfo: sweVMSAssetsOnMapStatistics.licenceInfo,
      incidentInfo: urgentByType
    };
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
  selectAssets,
  selectAssetMovements,
  (searchQuery, assets, assetMovements) => {
    if(searchQuery.length < 2) {
      return [];
    }
    return Object.keys(assets)
      .filter(key =>
        assets[key] !== undefined &&
        assets[key].name !== null &&
        assets[key].name !== undefined &&
        searchQuery !== undefined &&
        assets[key].name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      )
      .map(key => ({ assetMovement: assetMovements[key], asset: assets[key] } as Readonly<{
        assetMovement: AssetTypes.AssetMovement,
        asset: AssetTypes.Asset
      }>));
  }
);

export const getUnitTonnages = createSelector(
  selectUnitTonnages,
  (unitTonnages) => unitTonnages
);

export const getAssetByUrl = createSelector(
  selectAssets,
  getMergedRoute,
  (assets, mergedRoute) => {
    if(typeof assets[mergedRoute.params.assetId] !== 'undefined') {
      return assets[mergedRoute.params.assetId];
    }
    return undefined;
  }
);

export const getSelectedAsset = createSelector(
  selectSelectedAsset,
  selectAssets,
  (selectedAssetId, assets) => assets[selectedAssetId]
);

export const getSelectedMovement = createSelector(
  selectSelectedMovement,
  (selectedMovement) => selectedMovement
);

export const getLastFullPositionsForUrlAsset = createSelector(
  selectLastFullPositions, getAssetByUrl,
  (fullPositions: { [assetId: string]: ReadonlyArray<AssetTypes.Movement> }, asset: AssetTypes.Asset) =>
    typeof asset !== 'undefined' ? fullPositions[asset.id] : undefined
);

export const getLastFullPositionsForSelectedAsset = createSelector(
  selectLastFullPositions, selectSelectedAsset,
  (fullPositions: { [assetId: string]: ReadonlyArray<AssetTypes.Movement> }, assetId: string | null) =>
    typeof assetId !== 'undefined' && assetId !== null ? fullPositions[assetId] : undefined
);

export const getLastPollsForSelectedAsset = createSelector(
  selectLastPollsForAsset, selectSelectedAsset,
  (lastPollsForAsset, assetId) => typeof assetId !== 'undefined'
    && assetId !== null
    && typeof lastPollsForAsset[assetId] !== 'undefined'
      ? Object.values(lastPollsForAsset[assetId])
      : []
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
  getAssetByUrl,
  (assetLicences, selectedAssetUrl) => {
    if(typeof selectedAssetUrl === 'undefined' || typeof selectedAssetUrl.id === 'undefined') {
      return null;
    }
    return assetLicences[selectedAssetUrl.id];
  }
);
