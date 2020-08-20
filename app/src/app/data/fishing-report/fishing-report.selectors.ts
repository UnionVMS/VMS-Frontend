import { createSelector } from '@ngrx/store';
import * as FishingReportTypes from './fishing-report.types';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';

export const selectFishingReports = (state: State) => state.fishingReport.fishingReports;
export const selectPriorNotifications = (state: State) => state.fishingReport.priorNotifications;
export const selectFishingReportSearches = (state: State) => state.fishingReport.fishingReportSearches;
export const selectCurrentFishingReportSearch = (state: State) => state.fishingReport.currentFishingReportSearch;
export const selectLastUserSearchForFishingReport = (state: State) => state.fishingReport.lastUserSearchForFishingReport;


export const getFishingReports = createSelector(
  selectFishingReports,
  (fishingReports) => Object.values(fishingReports)
);

export const getLastUserSearchForFishingReportExtended = createSelector(
  selectFishingReports,
  selectPriorNotifications,
  selectFishingReportSearches,
  selectLastUserSearchForFishingReport,
  (fishingReports, priorNotifications, fishingReportSearches, lastUserSearchId) => {
    if(typeof fishingReportSearches[lastUserSearchId] === 'undefined') {
      return [];
    }

    return fishingReportSearches[lastUserSearchId].map(fishingReportId => {
      const fishingReport = fishingReports[fishingReportId];
      return {
        fishingReport,
        priorNotification: priorNotifications[fishingReport.priorNotificationId],
      };
    });
  }
);
