import { Action } from '@ngrx/store';
import { AssetMovement, AssetEssentialProperties } from './asset.interfaces';


export enum ActionTypes {
  AddForecast = '[Asset] Add forecast',
  AddPositionForInspection = '[Asset] Add position for inspection',
  AddAssets = '[Asset] Add assets',
  AssetMoved = '[Asset] Moved',
  AssetsMoved = '[Asset] Multiple moves',
  ClearForecasts = '[Asset] Clear forecasts',
  ClearTracks = '[Asset] Clear tracks',
  FailedToSubscribeToMovements = '[Asset] Failed to subscribe to movements',
  GetAssetTrack = '[Asset] Get asset track',
  GetAssetTrackFromTime = '[Asset] Get asset track from time',
  RemoveForecast = '[Asset] Remove forecast',
  RemovePositionForInspection = '[Asset] Remove position for inspection',
  SubscribeToMovements = '[Asset] Subscribe to movements',
  SelectAsset = '[Asset] Select asset',
  SetFullAsset = '[Asset] Set full asset',
  SetAssetTrack = '[Asset] Set asset track',
  UnsubscribeToMovements = '[Asset] Unsubscribe to movements',
  UntrackAsset = '[Asset] Untrack asset.',
  TrimTracksThatPassedTimeCap = '[Asset] Trim tracks that passed time cap',
  SetAutocompleteQuery = '[Asset] Set autocomplete query',
  SetFilterQuery = '[Asset] Set Filter Query',
  SetEssentialProperties = '[Asset] Set essential properties',


  GetAssetList = '[Asset] Get list',
  SetAssetList = '[Asset] Set list'
}

export class SetAutocompleteQuery implements Action {
  readonly type = ActionTypes.SetAutocompleteQuery;
  constructor(public payload: any) {}
}

export class SetFilterQuery implements Action {
  readonly type = ActionTypes.SetFilterQuery;
  constructor(public payload: any) {}
}

interface GetAssetListPayload {
  pageSize: number;
}
export class GetAssetList implements Action {
  readonly type = ActionTypes.GetAssetList;

  constructor(public payload: GetAssetListPayload) {}
}

export class SubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}

export class UnsubscribeToMovements implements Action {
  readonly type = ActionTypes.UnsubscribeToMovements;
}

export class AssetMoved implements Action {
  readonly type = ActionTypes.AssetMoved;

  constructor(public payload: AssetMovement) {}
}

export class AssetsMoved implements Action {
  readonly type = ActionTypes.AssetsMoved;

  constructor(public payload: Array<AssetMovement>) {}
}

export class SetEssentialProperties implements Action {
  readonly type = ActionTypes.SetEssentialProperties;
  constructor(public payload: { [uid: string]: AssetEssentialProperties } ) {}
}

export class FailedToSubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}

export class SelectAsset implements Action {
  readonly type = ActionTypes.SelectAsset;
  constructor(public payload: string) {}
}

export class AddAssets implements Action {
  readonly type = ActionTypes.AddAssets;
  constructor(public payload: any) {}
}

export class SetAssetList implements Action {
  readonly type = ActionTypes.SetAssetList;
  constructor(public payload: any) {}
}

export class SetFullAsset implements Action {
  readonly type = ActionTypes.SetFullAsset;
  constructor(public payload: any) {}
}

export class GetAssetTrack implements Action {
  readonly type = ActionTypes.GetAssetTrack;
  constructor(public payload: any) {}
}

export class GetAssetTrackFromTime implements Action {
  readonly type = ActionTypes.GetAssetTrackFromTime;
  constructor(public payload: any) {}
}

export class SetAssetTrack implements Action {
  readonly type = ActionTypes.SetAssetTrack;
  constructor(public payload: any) {}
}

export class UntrackAsset implements Action {
  readonly type = ActionTypes.UntrackAsset;
  constructor(public payload: any) {}
}

export class AddPositionForInspection implements Action {
  readonly type = ActionTypes.AddPositionForInspection;
  constructor(public payload: any) {}
}

export class RemovePositionForInspection implements Action {
  readonly type = ActionTypes.RemovePositionForInspection;
  constructor(public payload: any) {}
}

export class AddForecast implements Action {
  readonly type = ActionTypes.AddForecast;
  constructor(public payload: any) {}
}

export class RemoveForecast implements Action {
  readonly type = ActionTypes.RemoveForecast;
  constructor(public payload: any) {}
}

export class ClearForecasts implements Action {
  readonly type = ActionTypes.ClearForecasts;
}

export class ClearTracks implements Action {
  readonly type = ActionTypes.ClearTracks;
}

interface TrimTracksThatPassedTimeCapPayload {
  unixtime: number;
}
export class TrimTracksThatPassedTimeCap implements Action {
  readonly type = ActionTypes.TrimTracksThatPassedTimeCap;
  constructor(public payload: TrimTracksThatPassedTimeCapPayload) {}
}
