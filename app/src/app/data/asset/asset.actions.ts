import { Action } from '@ngrx/store';
import { Asset } from './asset.reducer';


export enum ActionTypes {
  SubscribeToMovements = '[Asset] Subscribe to movements',
  AssetMoved = '[Asset] Moved',
  AssetsMoved = '[Asset] Multiple moves',
  FailedToSubscribeToMovements = '[Asset] Failed to subscribe to movements',
}

export class SubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}

export class AssetMoved implements Action {
  readonly type = ActionTypes.AssetMoved;

  constructor(public payload: Asset) {}
}

export class FailedToSubscribeToMovements implements Action {
  readonly type = ActionTypes.SubscribeToMovements;
}
