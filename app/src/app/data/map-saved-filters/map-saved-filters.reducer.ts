import { on, createReducer } from '@ngrx/store';
import * as MapSavedFiltersActions from './map-saved-filters.actions';
import * as Types from './map-saved-filters.types';

export const initialState: Types.State = {
  activeFilters: [],
  savedFilters: {}
};

export const mapSavedFiltersReducer = createReducer(initialState,
  on(MapSavedFiltersActions.activateFilter, (state, { filterId }) => {
    if(state.activeFilters.includes(filterId)) {
      return state;
    }
    return {
      ...state,
      activeFilters: [
        ...state.activeFilters,
        filterId
      ]
    };
  }),
  on(MapSavedFiltersActions.deactivateFilter, (state, { filterId }) => {
    if(state.activeFilters.includes(filterId)) {
      const newActiveFilters = [ ...state.activeFilters ];
      newActiveFilters.splice(state.activeFilters.indexOf(filterId), 1);
      return { ...state, activeFilters: newActiveFilters };
    }
    return state;
  }),
  on(MapSavedFiltersActions.addSavedFilter, (state, { filter }) => ({
    ...state,
    savedFilters: {
      ...state.savedFilters,
      [filter.id]: filter
    }
  })),
  on(MapSavedFiltersActions.removeSavedFilter, (state, { filterId }) => ({
    ...state,
    savedFilters: Object.keys(state.savedFilters).reduce((acc, id) => {
      if (id !== filterId) {
        return { ...acc, [id]: state.savedFilters[id] };
      }
      return acc;
    }, {})
  })),
  on(MapSavedFiltersActions.setSavedFitlers, (state, { filters }) => ({
    ...state,
    savedFilters: filters
  })),
);
