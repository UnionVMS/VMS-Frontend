import { Action } from '@ngrx/store';

export enum ActionTypes {
  GetAreas = '[Map Layers] Get areas',
}

export class GetAreas implements Action {
  readonly type = ActionTypes.GetAreas;
}
