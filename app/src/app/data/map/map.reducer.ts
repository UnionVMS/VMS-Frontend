import { createReducer, on } from '@ngrx/store';
import * as MapsActions from './map.actions';
import * as Interfaces from './map.interfaces';

export const initialState: Interfaces.State = {
  mapSettingsLoaded: false,
  realtime: {
    ready: false,
  },
  report: {
    searching: false,
  }
};

export const mapReducer = createReducer(initialState,
  on(MapsActions.setReady, (state, { ready }) => ({
    ...state,
    realtime: { ...state.realtime, ready }
  })),
  on(MapsActions.setMapSettingsLoaded, (state, { mapSettingsLoaded }) => ({
    ...state,
    mapSettingsLoaded,
  })),
  on(MapsActions.setReportSearching, (state, { searching }) => ({
    ...state,
    report: { ...state.report, searching }
  })),
);
