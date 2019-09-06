import { on, createReducer } from '@ngrx/store';
import * as MapSavedFiltersActions from './map-saved-filters.actions';
import * as Interfaces from './map-saved-filters.interfaces';

export const initialState: Interfaces.State = {
  activeFilters: [],
  savedFilters: {}
};

export const mapSavedFiltersReducer = createReducer(initialState,
  on(MapSavedFiltersActions.activateFilter, (state, { filterName }) => {
    if(state.activeFilters.includes(filterName)) {
      return state;
    }
    return {
      ...state,
      activeFilters: [
        ...state.activeFilters,
        filterName
      ]
    };
  }),
  on(MapSavedFiltersActions.deactivateFilter, (state, { filterName }) => {
    if(state.activeFilters.includes(filterName)) {
      const newActiveFilters = [ ...state.activeFilters ];
      newActiveFilters.splice(state.activeFilters.indexOf(filterName), 1);
      return { ...state, activeFilters: newActiveFilters };
    }
    return state;
  }),
  on(MapSavedFiltersActions.addSavedFilter, (state, { filter }) => ({
    ...state,
    savedFilters: {
      ...state.savedFilters,
      [filter.name]: filter.filter
    }
  })),
  on(MapSavedFiltersActions.setSavedFitlers, (state, { filters }) => ({
    ...state,
    savedFilters: filters
  })),
);
