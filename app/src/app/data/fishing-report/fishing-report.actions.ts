import { createAction, props } from '@ngrx/store';
import * as FishingReportTypes from './fishing-report.types';

export const search = createAction(
  '[Fishing report] search',
  props<{ query: object }>()
);

export const setFishingReports = createAction(
  '[Fishing report] Set fishing reports',
  props<{ fishingReports: FishingReportTypes.FishingReports }>()
);
