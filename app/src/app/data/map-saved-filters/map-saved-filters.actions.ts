import { createAction, props } from '@ngrx/store';
import { SavedFilter } from './map-saved-filters.types';

export const activateFilter = createAction(
  '[MapSavedFilters] Activate',
  props<{ filterId: string }>()
);

export const deactivateFilter = createAction(
  '[MapSavedFilters] Deactivate',
  props<{ filterId: string }>()
);

export const deleteFilter = createAction(
  '[MapSavedFilters] Delete',
  props<{ filterId: string }>()
);

export const addSavedFilter = createAction(
  '[MapSavedFilters] Add',
  props<{ filter: SavedFilter }>()
);

export const removeSavedFilter = createAction(
  '[MapSavedFilters] Remove',
  props<{ filterId: string }>()
);

export const getAll = createAction(
  '[MapSavedFilters] Get all'
);

export const saveFilter =  createAction(
  '[MapSavedFilters] save',
  props<{ filter: SavedFilter }>()
);

export const setSavedFitlers = createAction(
  '[MapSavedFilters] Set',
  props<{ filters: { readonly [id: number]: SavedFilter } }>()
);
