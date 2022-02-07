import { createSelector } from '@ngrx/store';
import * as ActivityTypes from './activity.types';
import { State } from '@app/app-reducer';

export const selectLatestsActivities = (state: State) => state.activity.latestActivities;
export const selectActivityTracks = (state: State) => state.activity.activityTracks;

export const getLatestActivities = createSelector(
  selectLatestsActivities,
  (latestActivities: { [assetId: string]: ActivityTypes.Activity }) => latestActivities
);

export const getActivityTracks = createSelector(
  selectActivityTracks,
  (activityTracks: { [assetId: string]: ReadonlyArray<ActivityTypes.Activity> }) => activityTracks
);
