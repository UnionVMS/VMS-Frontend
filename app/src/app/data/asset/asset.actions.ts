import { Action } from '@ngrx/store';
import { Asset } from './asset.reducer';


export enum ActionTypes {
  SubscribeToMovements = '[Asset] Subscribe to movements',
  UnsubscribeToMovements = '[Asset] Unsubscribe to movements',
  AssetMoved = '[Asset] Moved',
  AssetsMoved = '[Asset] Multiple moves',
  FailedToSubscribeToMovements = '[Asset] Failed to subscribe to movements',
  SelectAsset = '[Asset] Select asset',
  SetFullAsset = '[Asset] Set full asset',
  GetAssetTrack = '[Asset] Get asset track',
  SetAssetTrack = '[Asset] Set asset track',
  AddPositionForInspection = '[Asset] Add position for inspection',
  RemovePositionForInspection = '[Asset] Remove position for inspection',
}

export class SubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}

export class UnsubscribeToMovements implements Action {
  readonly type = ActionTypes.UnsubscribeToMovements;
}

export class AssetMoved implements Action {
  readonly type = ActionTypes.AssetMoved;

  constructor(public payload: Asset) {}
}

export class AssetsMoved implements Action {
  readonly type = ActionTypes.AssetsMoved;

  constructor(public payload: Array<Asset>) {}
}

export class FailedToSubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}

export class SelectAsset implements Action {
  readonly type = ActionTypes.SelectAsset;
  constructor(public payload: string) {}
}

export class SetFullAsset implements Action {
  readonly type = ActionTypes.SetFullAsset;
  constructor(public payload: any) {}
}

export class GetAssetTrack implements Action {
  readonly type = ActionTypes.GetAssetTrack;
  constructor(public payload: any) {}
}

export class SetAssetTrack implements Action {
  readonly type = ActionTypes.SetAssetTrack;
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
