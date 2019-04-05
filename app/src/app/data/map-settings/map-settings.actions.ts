import { Action } from '@ngrx/store';
// import { Asset } from './map-settings.reducer';


export enum ActionTypes {
  SetVisibilityForAssetNames = '[MapSettings] Set visiblity for asset names',
  SetVisibilityForAssetSpeeds = '[MapSettings] Set visiblity for asset speeds',
  SetVisibilityForFlags = '[MapSettings] Set visiblity for flags',
  SetVisibilityForTracks = '[MapSettings] Set visiblity for tracks',
  SetVisibilityForForecast = '[MapSettings] Set visiblity for forecast',
  SetTracksMinuteCap = '[MapSettings] Set tracks minute cap',
  SetForecastInterval = '[MapSettings] Set forecast interval',
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

export class SetVisibilityForForecast implements Action {
  readonly type = ActionTypes.SetVisibilityForForecast;
  constructor(public payload: boolean) {}
}

export class SetTracksMinuteCap implements Action {
  readonly type = ActionTypes.SetTracksMinuteCap;
  constructor(public payload: number) {}
}

export class SetForecastInterval implements Action {
  readonly type = ActionTypes.SetForecastInterval;
  constructor(public payload: number) {}
}

export class SaveViewport implements Action {
  readonly type = ActionTypes.SaveViewport;
  constructor(public payload: any) {}
}
