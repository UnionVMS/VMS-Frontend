import { Action, createAction, props } from '@ngrx/store';
import * as AssetInterfaces from './asset.interfaces';

export const addForecast = createAction(
  '[Asset] Add forecast',
  props<{ assetId: string }>()
);

export const addPositionForInspection = createAction(
  '[Asset] Add position for inspection',
  props<{ positionForInspection: AssetInterfaces.Movement }>()
);

export const assetMoved = createAction(
  '[Asset] Moved',
  props<{ assetMovement: AssetInterfaces.AssetMovement }>()
);

export const assetsMoved = createAction(
  '[Asset] Multiple moves',
  props<{ assetMovements: { [assetId: string]: AssetInterfaces.AssetMovement } }>()
);

export const checkForAssetEssentials = createAction(
  '[Asset] Check for essentials',
  props<{ assetMovements: Array<AssetInterfaces.AssetMovement> }>()
);

export const clearAssetGroup = createAction(
  '[Asset] Clear assetgroup',
  props<{ assetGroup: AssetInterfaces.AssetGroup }>()
);

export const clearForecasts = createAction(
  '[Asset] Clear forecasts'
);

export const clearTracks = createAction(
  '[Asset] Clear tracks'
);

export const deselectAsset = createAction(
  '[Asset] Deselect',
  props<{ assetId: string }>()
);

export const failedToSubscribeToMovements = createAction(
  '[Asset] Failed to subscribe to movements'
);

export const getAssetGroups = createAction(
  '[Asset] Get groups'
);

export const getAssetList = createAction(
  '[Asset] Get list',
  props<{ pageSize: number }>()
);

export const getAssetTrack = createAction(
  '[Asset] Get asset track',
  props<{ assetId: string, movementGuid: string }>()
);

export const getAssetTrackFromTime = createAction(
  '[Asset] Get asset track from time',
  props<{ assetId: string, datetime: Date }>()
);

export const removeAssets = createAction(
  '[Asset] Remove asset',
  props<{ assets: Array<string>}>()
);

export const removeForecast = createAction(
  '[Asset] Remove forecast',
  props<{ assetId: string }>()
);

export const removePositionForInspection = createAction(
  '[Asset] Remove position for inspection',
  props<{ inspectionId: string }>()
);

export const searchAssets = createAction(
  '[Asset] search',
  props<{ requestParams: any }>()
);

export const selectAsset = createAction(
  '[Asset] Select asset',
  props<{ assetId: string }>()
);

export const setAssetGroup = createAction(
  '[Asset] Set assetgroup',
  props<{ assetGroup: AssetInterfaces.AssetGroup }>()
);

export const setAssetGroups = createAction(
  '[Asset] Set groups',
  props<{ assetGroups: Array<AssetInterfaces.AssetGroup> }>()
);

export const setAssetList = createAction(
  '[Asset] Set list',
  props<{ searchParams: any, assets: { [uid: string]: AssetInterfaces.Asset }, currentPage: number, totalNumberOfPages: number  }>()
);

export const setAssetTrack = createAction(
  '[Asset] Set asset track',
  props<{  tracks: any, assetId: string, visible: boolean  }>()
);

export const setAutocompleteQuery = createAction(
  '[Asset] Set autocomplete query',
  props<{ searchQuery: string }>()
);

export const setEssentialProperties = createAction(
  '[Asset] Set essential properties',
  props<{ assetEssentialProperties: { [uid: string]: AssetInterfaces.AssetEssentialProperties } }>()
);

export const setFilterQuery = createAction(
  '[Asset] Set Filter Query',
  props<{ filterQuery: Array<AssetInterfaces.AssetFilterQuery> }>()
);

export const setFullAsset = createAction(
  '[Asset] Set full asset',
  props<{ asset: AssetInterfaces.Asset }>()
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
  props<{assetMovements: { [uid: string]: AssetInterfaces.AssetMovement }}>()
);

export const unsubscribeToMovements = createAction(
  '[Asset] Unsubscribe to movements'
);

export const untrackAsset = createAction(
  '[Asset] Untrack asset',
  props<{ assetId: string }>()
);
