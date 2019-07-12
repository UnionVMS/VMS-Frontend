import { Action } from '@ngrx/store';
import { State, SavedFilter } from './map-saved-filters.interfaces';


export enum ActionTypes {
  AddSavedFilter = '[MapSavedFilters] Add',
  SetSavedFitlers = '[MapSavedFilters] Set',
  ActivateFilter = '[MapSavedFilters] Activate',
  DeactivateFilter = '[MapSavedFilters] Deactivate',
}

export class ActivateFilter implements Action {
  readonly type = ActionTypes.ActivateFilter;
  constructor(public payload: string) {}
}

export class DeactivateFilter implements Action {
  readonly type = ActionTypes.DeactivateFilter;
  constructor(public payload: string) {}
}


export class AddSavedFilter implements Action {
  readonly type = ActionTypes.AddSavedFilter;
  constructor(public payload: SavedFilter) {}
}

export class SetSavedFitlers implements Action {
  readonly type = ActionTypes.SetSavedFitlers;
  constructor(public payload: State) {}
}
