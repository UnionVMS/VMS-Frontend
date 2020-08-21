import { createReducer, on } from '@ngrx/store';
import * as FishingReportActions from './fishing-report.actions';
import * as FishingReportTypes from './fishing-report.types';

export const initialState: FishingReportTypes.State = {
  fishingReports: {},
  priorNotifications: {},
  fishingReportSearches: {},
  currentFishingReportSearch: '',
  lastUserSearchForFishingReport: '',
};

export const fishingReportReducer = createReducer(initialState,
  on(FishingReportActions.addFishingReportSearchResult, (state, { searchId, fishingReportIds, isUserSearch }) => ({
    ...state,
    fishingReportSearches: {
      ...state.fishingReportSearches,
      [searchId]: fishingReportIds
    },
    currentFishingReportSearch: searchId,
    lastUserSearchForFishingReport: isUserSearch ? searchId : state.lastUserSearchForFishingReport
  })),
  on(FishingReportActions.addFishingReports, (state, { fishingReports }) => ({
    ...state,
    fishingReports: {
      ...state.fishingReports,
      ...fishingReports
    }
  })),
  on(FishingReportActions.addPriorNotifications, (state, { priorNotifications }) => ({
    ...state,
    priorNotifications: {
      ...state.priorNotifications,
      ...priorNotifications
    }
  })),
);
