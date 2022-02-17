import { createSelector } from '@ngrx/store';
import * as ActivityTypes from './activity.types';
import { State } from '@app/app-reducer';

export const selectSelectedActivity = (state: State) => state.activity.selectedActivity;
export const selectLatestsActivities = (state: State) => state.activity.latestActivities;
export const selectActivityTracks = (state: State) => state.activity.activityTracks;

export const getSelectedActivity = createSelector(
  selectSelectedActivity,
  (selectedActivity) => selectedActivity
);

export const getLatestActivities = createSelector(
  selectLatestsActivities,
  (latestActivities: { [assetId: string]: ActivityTypes.Activity }) => latestActivities
);

export const getActivityTracks = createSelector(
  selectActivityTracks,
  (activityTracks: { [assetId: string]: ReadonlyArray<ActivityTypes.Activity> }) => activityTracks
);
