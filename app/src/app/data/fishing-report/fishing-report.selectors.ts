import { createSelector } from '@ngrx/store';
import * as FishingReportTypes from './fishing-report.types';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';

export const selectFishingReports = (state: State) => state.fishingReport.fishingReports;

export const getFishingReports =  createSelector(
  selectFishingReports,
  (fishingReports) => Object.values(fishingReports)
);
