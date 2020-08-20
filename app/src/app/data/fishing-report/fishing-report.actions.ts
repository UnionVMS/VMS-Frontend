import { createAction, props } from '@ngrx/store';
import * as FishingReportTypes from './fishing-report.types';

export const addFishingReportSearchResult = createAction(
  '[Fishing report] Add fishing report search result',
  props<{ searchId: string; fishingReportIds: ReadonlyArray<string>, isUserSearch: boolean; }>()
);

export const addFishingReports = createAction(
  '[Fishing report] Add fishing reports',
  props<{ fishingReports: FishingReportTypes.FishingReports; }>()
);

export const addPriorNotifications = createAction(
  '[Fishing report] Add prior notifications',
  props<{ priorNotifications: FishingReportTypes.PriorNotifications; }>()
);

export const search = createAction(
  '[Fishing report] search',
  props<{ query: { username: string }, isUserSearch: boolean; }>()
);
