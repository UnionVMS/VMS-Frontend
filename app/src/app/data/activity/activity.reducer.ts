import { createReducer, on } from '@ngrx/store';

import * as ActivityActions from './activity.actions';
import * as Types from './activity.types';

export const initialState: Types.State = {
  latestActivities: {},
  activityTracks: {}
};

export const activityReducer = createReducer(initialState,
  on(ActivityActions.addActivities, (state, { activities }) => {
      const newLatestActivities = Object.keys(activities).reduce((currentAssetActivities, assetId) => {
        if (typeof currentAssetActivities[assetId] === 'undefined'
          || activities[assetId].startDate >= currentAssetActivities[assetId].startDate) {
          currentAssetActivities[assetId] = activities[assetId];
        }
        return currentAssetActivities;
      }, { ...state.latestActivities });
      const newActivityTracks = Object.keys(activities).reduce((currentActivityTracks, assetId) => {
        if (typeof currentActivityTracks[assetId] !== 'undefined') {
          currentActivityTracks = {
            ...currentActivityTracks,
            [assetId]: currentActivityTracks[assetId].concat(activities[assetId])
          }
        }
        return currentActivityTracks;
      }, { ...state.activityTracks });
    return {
      ...state,
      latestActivities: newLatestActivities,
      activityTracks: newActivityTracks
    };
  }),
  on(ActivityActions.addActivityTrack, (state, { assetId, activities }) => {
    return {
      ...state,
      activityTracks: { ...state.activityTracks,
        [assetId]: activities
      }
    };
  }),
  on(ActivityActions.removeTracks, (state) => ({
    ...state,
    activityTracks: {}
  })),
  on(ActivityActions.removeActivityTrack, (state, { assetId }) => {
    const activityTracks = { ...state.activityTracks };
    delete activityTracks[assetId];
    return { ...state, activityTracks };
  }),
);
