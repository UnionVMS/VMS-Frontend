import { Action } from '@ngrx/store';
// import { Asset } from './map-settings.reducer';


export enum ActionTypes {
  SetVisibilityForAssetNames = '[MapSettings] Set visiblity for asset names',
  SetVisibilityForAssetSpeeds = '[MapSettings] Set visiblity for asset speeds',
  SetVisibilityForFlags = '[MapSettings] Set visiblity for flags',
  SetVisibilityForTracks = '[MapSettings] Set visiblity for tracks',
  SaveViewport = '[MapSettings] Save viewport',
}

export class SetVisibilityForAssetNames implements Action {
  readonly type = ActionTypes.SetVisibilityForAssetNames;
  constructor(public payload: boolean) {}
}

export class SetVisibilityForAssetSpeeds implements Action {
  readonly type = ActionTypes.SetVisibilityForAssetSpeeds;
  constructor(public payload: boolean) {}
}

export class SetVisibilityForFlags implements Action {
  readonly type = ActionTypes.SetVisibilityForFlags;
  constructor(public payload: boolean) {}
}

export class SetVisibilityForTracks implements Action {
  readonly type = ActionTypes.SetVisibilityForTracks;
  constructor(public payload: boolean) {}
}

export class SaveViewport implements Action {
  readonly type = ActionTypes.SaveViewport;
  constructor(public payload: any) {}
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
