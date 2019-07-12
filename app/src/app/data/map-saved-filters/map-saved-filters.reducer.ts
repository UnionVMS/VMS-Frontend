import { Action } from '@ngrx/store';
import { ActionTypes } from './map-saved-filters.actions';
import * as Interfaces from './map-saved-filters.interfaces';

export const initialState: Interfaces.State = {
  activeFilters: [],
  savedFilters: {}
};

export function mapSavedFiltersReducer(state = initialState, { type, payload }) {
  switch (type) {
    case ActionTypes.ActivateFilter:
      if(state.activeFilters.includes(payload)) {
        return state;
      }
      return { ...state, activeFilters: [
        ...state.activeFilters,
        payload
      ]};
    case ActionTypes.DeactivateFilter:
      if(state.activeFilters.includes(payload)) {
        const newActiveFilters = [ ...state.activeFilters ];
        newActiveFilters.splice(state.activeFilters.indexOf(payload), 1);
        return { ...state, activeFilters: newActiveFilters };
      }
      return state;
    case ActionTypes.AddSavedFilter:
      return { ...state, savedFilters: {
        ...state.savedFilters,
        [payload.name]: payload.filter
      }};
    case ActionTypes.SetSavedFitlers:
      return {
        ...state,
        savedFilters: payload
      };
    default:
      return state;
  }
}
