import { createReducer, on } from '@ngrx/store';
import * as FishingReportActions from './fishing-report.actions';
import * as FishingReportTypes from './fishing-report.types';

export const initialState: FishingReportTypes.State = {
  fishingReports: {}
};

export const fishingReportReducer = createReducer(initialState,
  on(FishingReportActions.setFishingReports, (state, { fishingReports }) => ({
    ...state,
    fishingReports
  })),
);
