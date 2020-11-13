import { createReducer, on } from '@ngrx/store';
import * as MapsActions from './map.actions';
import * as Types from './map.types';

export const initialState: Types.State = {
  mapSettingsLoaded: false,
  realtime: {
    ready: false,
  },
  report: {
    searching: false,
  },
  filtersActive: {
    filter: true,
    savedFilters: true,
    assetGroups: true
  },
  activeLeftPanel: ['filters'],
  activeRightPanel: ['information'],
  activeInformationPanel: null,
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
  on(MapsActions.setGivenFilterActive, (state, { filterTypeName, status }) => ({
    ...state,
    filtersActive: { ...state.filtersActive, [filterTypeName]: status },
  })),
  on(MapsActions.setActiveLeftPanel, (state, { activeLeftPanel }) => ({
    ...state,
    activeLeftPanel
  })),
  on(MapsActions.setActiveRightPanel, (state, { activeRightPanel }) => ({
    ...state,
    activeRightPanel
  })),
  on(MapsActions.setActiveInformationPanel, (state, { activeInformationPanel }) => ({
    ...state,
    activeInformationPanel
  })),
);
