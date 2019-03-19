import { Action } from '@ngrx/store';
// import { Asset } from './map-settings.reducer';


export enum ActionTypes {
  SetVisibilityForAssetNames = '[MapSettings] Set visiblity for asset names',
  SetVisibilityForAssetSpeeds = '[MapSettings] Set visiblity for asset speeds',
  // UnsubscribeToMovements = '[Asset] Unsubscribe to movements',
  // AssetMoved = '[Asset] Moved',
  // AssetsMoved = '[Asset] Multiple moves',
  // FailedToSubscribeToMovements = '[Asset] Failed to subscribe to movements',
}

export class SetVisibilityForAssetNames implements Action {
  readonly type = ActionTypes.SetVisibilityForAssetNames;
  constructor(public payload: boolean) {}
}

export class SetVisibilityForAssetSpeeds implements Action {
  readonly type = ActionTypes.SetVisibilityForAssetSpeeds;
  constructor(public payload: boolean) {}
}
//
// export class UnsubscribeToMovements implements Action {
//   readonly type = ActionTypes.UnsubscribeToMovements;
// }
//
// export class AssetMoved implements Action {
//   readonly type = ActionTypes.AssetMoved;
//
//   constructor(public payload: Asset) {}
// }
//
// export class FailedToSubscribeToMovements implements Action {
//   readonly type = ActionTypes.SubscribeToMovements;
// }
