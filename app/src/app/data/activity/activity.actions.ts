import { createAction, props } from '@ngrx/store';
import * as ActivityType from './activity.types';

export const selectActivity = createAction(
  '[Activity] Select activity',
  props<{ activityId: string | null }>()
);

export const addActivities = createAction(
  '[Activity] Add activities',
  props<{ activities: { [assetId: string]: ActivityType.Activity }}>()
);

export const getInitialActivities = createAction(
  '[Activity] Get initial activities'
);

export const getActivityTrack = createAction(
  '[Activity] Get activity track',
  props<{ assetId: string, startDate: number }>()
);

export const addActivityTrack = createAction(
  '[Activity] Add activity track',
  props<{ assetId: string, activities: ReadonlyArray<ActivityType.Activity> }>()
);

export const removeActivityTrack = createAction(
  '[Activity] Remove activity track',
  props<{ assetId: string }>()
);

export const removeTracks = createAction(
  '[Activity] Remove tracks'
);
