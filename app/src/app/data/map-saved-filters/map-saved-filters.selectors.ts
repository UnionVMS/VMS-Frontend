import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as MapSavedFiltersInterface from './map-saved-filters.interfaces';
import { AssetFilterQuery } from '../asset/asset.interfaces';
import { State } from '@app/app-reducer';

export const selectActiveFilters = (state: State) => state.mapSavedFilters.activeFilters;
export const selectSavedFilters = (state: State) => state.mapSavedFilters.savedFilters;

export const getSavedFilters = createSelector(
  selectSavedFilters,
  (savedFilters: { [filterName: string]: Array<AssetFilterQuery> }) => {
    return { ...savedFilters };
  }
);

export const getActiveFilters = createSelector(
  selectActiveFilters,
  selectSavedFilters,
  (
    activeFilters: Array<string>,
    savedFilters: { [filterName: string]: Array<AssetFilterQuery> }
  ) => {
    return activeFilters.map(filterName => savedFilters[filterName]);
  }
);
