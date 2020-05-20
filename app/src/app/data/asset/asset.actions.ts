import { Action, createAction, props } from '@ngrx/store';
import * as AssetTypes from './asset.types';
import * as IncidentTypes from '@data/incident/incident.types';

export const addForecast = createAction(
  '[Asset] Add forecast',
  props<{ assetId: string }>()
);

export const addPositionForInspection = createAction(
  '[Asset] Add position for inspection',
  props<{ positionForInspection: AssetTypes.Movement }>()
);

export const assetMoved = createAction(
  '[Asset] Moved',
  props<{ assetMovement: AssetTypes.AssetMovement }>()
);

export const assetsMoved = createAction(
  '[Asset] Multiple moves',
  props<{ assetMovements: { [assetId: string]: AssetTypes.AssetMovement } }>()
);

export const checkForAssetEssentials = createAction(
  '[Asset] Check for essentials',
  props<{ assetIds: ReadonlyArray<string> }>()
);

export const clearAssetGroup = createAction(
  '[Asset] Clear assetgroup',
  props<{ assetGroup: AssetTypes.AssetGroup }>()
);

export const clearForecasts = createAction(
  '[Asset] Clear forecasts'
);

export const clearTracks = createAction(
  '[Asset] Clear tracks'
);

export const clearSelectedAssets = createAction(
  '[Asset] Clear selected assets'
);

export const createManualMovement = createAction(
  '[Asset] Create manual movement',
  props<{ manualMovement: AssetTypes.ManualMovement }>()
);

export const deselectAsset = createAction(
  '[Asset] Deselect',
  props<{ assetId: string }>()
);

export const failedToSubscribeToMovements = createAction(
  '[Asset] Failed to subscribe to movements',
  props<{ error: any }>()
);

export const getAssetTrack = createAction(
  '[Asset] Get asset track',
  props<{ assetId: string, movementId: string }>()
);

export const getAssetTrackTimeInterval = createAction(
  '[Asset] Get asset track time interval',
  props<{ assetId: string, startDate: number, endDate: number, sources: ReadonlyArray<string> }>()
);

export const getTracksByTimeInterval = createAction(
  '[Asset] Get asset tracks by time interval',
  props<{ query: any, startDate: number, endDate: number, sources: string[] }>()
);

export const getLastFullPositionsForAsset = createAction(
  '[Asset] Get last full positions for asset',
  props<{ assetId: string, amount: number, sources?: string[] }>()
);

export const getSelectedAsset = createAction(
  '[Asset] Get selected asset'
);

export const getUnitTonnage = createAction(
  '[Asset] Get unit tonnage'
);

export const removeAssets = createAction(
  '[Asset] Remove asset',
  props<{ assetIds: Array<string>}>()
);

export const removeForecast = createAction(
  '[Asset] Remove forecast',
  props<{ assetId: string }>()
);

export const removePositionForInspection = createAction(
  '[Asset] Remove position for inspection',
  props<{ inspectionId: string }>()
);

export const removeMovementsAndTracks = createAction(
  '[Asset] Remove movements and tracks'
);

export const removeTracks = createAction(
  '[Asset] Remove tracks'
);

export const saveAsset = createAction(
  '[Asset] Save',
  props<{ asset: AssetTypes.Asset }>()
);

export const searchAssets = createAction(
  '[Asset] search',
  props<{ searchQuery: AssetTypes.AssetListSearchQuery, userSearch?: boolean }>()
);

export const selectAsset = createAction(
  '[Asset] Select asset',
  props<{ assetId: string }>()
);

export const selectIncident = createAction(
  '[Asset] Select incident',
  props<{ incident: IncidentTypes.assetNotSendingIncident, incidentType: string }>()
);

export const setAutocompleteQuery = createAction(
  '[Asset] Set autocomplete query',
  props<{ searchQuery: string }>()
);

export const setAssetTripGranularity = createAction(
  '[Asset] Set asset trip granularity',
  props<{ assetTripGranularity: number }>()
);

export const setAssetTrips = createAction(
  '[Asset] Set asset trips',
  props<{ assetMovements: ReadonlyArray<AssetTypes.AssetMovement> }>()
);

export const setAssetPositionsFromTripByTimestamp = createAction(
  '[Asset] Set asset positions from trip by timestamp',
  props<{ assetTripTimestamp: number }>()
);

export const setAsset = createAction(
  '[Asset] Set asset',
  props<{ asset: AssetTypes.Asset }>()
);

export const setAssetGroup = createAction(
  '[Asset] Set assetgroup',
  props<{ assetGroup: AssetTypes.AssetGroup }>()
);

export const setAssetGroups = createAction(
  '[Asset] Set groups',
  props<{ assetGroups: Array<AssetTypes.AssetGroup> }>()
);

export const setAssetList = createAction(
  '[Asset] Set list',
  props<{ searchQuery: AssetTypes.AssetListSearchQuery, assets: { [uid: string]: AssetTypes.Asset }, userSearch: boolean }>()
);

export const setCurrentAssetList = createAction(
  '[Asset] Set current asset list',
  props<{ assetListIdentifier: string }>()
);

export const setLastFullPositions = createAction(
  '[Asset] Set last full positions',
  props<{ fullPositionsByAsset: { [assetId: string]: ReadonlyArray<AssetTypes.FullMovement> } }>()
);

export const setEssentialProperties = createAction(
  '[Asset] Set essential properties',
  props<{ assetEssentialProperties: { [uid: string]: AssetTypes.AssetEssentialProperties } }>()
);

export const setFilterQuery = createAction(
  '[Asset] Set Filter Query',
  props<{ filterQuery: Array<AssetTypes.AssetFilterQuery> }>()
);

export const setFullAsset = createAction(
  '[Asset] Set full asset',
  props<{ asset: AssetTypes.Asset }>()
);

export const setTracksForAsset = createAction(
  '[Asset] Set tracks for asset',
  props<{ tracks: any, assetId: string, sources: ReadonlyArray<string> }>()
);

export const setTracks = createAction(
  '[Asset] Set tracks',
  props<{ tracksByAsset: { [assetId: string]: ReadonlyArray<AssetTypes.Movement> } }>()
);

export const setAssetPositionsWithoutAffectingTracks = createAction(
  '[Asset] Set asset positions witought affecting tracks.',
  props<{ movementsByAsset: { readonly [assetId: string]: AssetTypes.AssetMovement } }>()
);

export const setUnitTonnage = createAction(
  '[Asset] Set unit tonnage',
  props<{ unitTonnages: Array<AssetTypes.UnitTonnage> }>()
);

export const subscribeToMovements = createAction(
  '[Asset] Subscribe to movements'
);

export const trimTracksThatPassedTimeCap = createAction(
  '[Asset] Trim tracks that passed time cap',
  props<{ unixtime: number }>()
);

export const updateDecayOnAssetPosition = createAction(
  '[Asset] Update decay',
  props<{assetMovements: { [uid: string]: AssetTypes.AssetMovement }}>()
);

export const unsubscribeToMovements = createAction(
  '[Asset] Unsubscribe to movements'
);

export const untrackAsset = createAction(
  '[Asset] Untrack asset',
  props<{ assetId: string }>()
);
