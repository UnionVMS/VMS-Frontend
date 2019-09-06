import { Action, createAction, props } from '@ngrx/store';
import { SavedFilter } from './map-saved-filters.interfaces';
import { AssetFilterQuery } from '@data/asset/asset.interfaces';

export const activateFilter = createAction(
  '[MapSavedFilters] Activate',
  props<{ filterName: string }>()
);

export const deactivateFilter = createAction(
  '[MapSavedFilters] Deactivate',
  props<{ filterName: string }>()
);

export const addSavedFilter = createAction(
  '[MapSavedFilters] Add',
  props<{ filter: SavedFilter }>()
);

export const setSavedFitlers = createAction(
  '[MapSavedFilters] Set',
  props<{ filters: { [filterName: string]: Array<AssetFilterQuery> } }>()
);
