import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SavedFilter } from './map-saved-filters.types';
import { AssetFilterQuery } from '../asset/asset.types';
import { State } from '@app/app-reducer';

export const selectActiveFilters = (state: State) => state.mapSavedFilters.activeFilters;
export const selectSavedFilters = (state: State) => state.mapSavedFilters.savedFilters;

export const getAllFilters = createSelector(
  selectSavedFilters,
  (savedFilters: Readonly<{ [id: string]: SavedFilter }>) => {
    return Object.values(savedFilters);
  }
);

export const getFilters = createSelector(
  selectSavedFilters,
  (savedFilters: Readonly<{ [id: string]: SavedFilter }>) => {
    return Object.values(savedFilters).reduce((acc: ReadonlyArray<SavedFilter>, filter: SavedFilter) => {
      if(filter.filter.find((filterQuery) => filterQuery.type === 'GUID') === undefined) {
        return [ ...acc, filter];
      }
      return acc;
    }, []);
  }
);

export const getAssetGroupFilters = createSelector(
  selectSavedFilters,
  (savedFilters: Readonly<{ [id: string]: SavedFilter }>) => {
    return Object.values(savedFilters).reduce((acc: ReadonlyArray<SavedFilter>, filter: SavedFilter) => {
      if(filter.filter.find((filterQuery) => filterQuery.type === 'GUID') !== undefined) {
        return [ ...acc, filter];
      }
      return acc;
    }, []);
  }
);

export const getActiveFilters = createSelector(
  selectActiveFilters,
  selectSavedFilters,
  (
    activeFilters: Array<string>,
    savedFilters: Readonly<{ [id: string]: SavedFilter }>
  ) => {
    return activeFilters.map(id => savedFilters[id]);
  }
);
