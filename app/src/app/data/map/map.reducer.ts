import { createReducer, on } from '@ngrx/store';
import * as MapsActions from './map.actions';
import * as Interfaces from './map.interfaces';

export const initialState: Interfaces.State = {
  ready: false,
};

export const mapReducer = createReducer(initialState,
  on(MapsActions.setReady, (state, { ready }) => ({
    ...state,
    ready
  })),
);
