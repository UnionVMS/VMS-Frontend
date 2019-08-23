import { Action } from '@ngrx/store';
import { TrackPanelColumn } from './track-panel.interfaces';


export enum ActionTypes {
  ClearTrackPanelColumn = '[Asset] Clear track panel column',
  SetTrackPanelColumn = '[Asset] Set track panel column',
}



export class ClearTrackPanelColumn implements Action {
  readonly type = ActionTypes.ClearTrackPanelColumn;
  constructor(public payload: number) {}
}

export class SetTrackPanelColumn implements Action {
  readonly type = ActionTypes.SetTrackPanelColumn;
  constructor(public payload: number) {}
}
