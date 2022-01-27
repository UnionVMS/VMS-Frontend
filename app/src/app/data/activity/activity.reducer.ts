import { createReducer, on } from '@ngrx/store';

import * as ActivityActions from './activity.actions';
import * as Types from './activity.types';

export const initialState: Types.State = {
  assetActivities: {}
};

export const activityReducer = createReducer(initialState,
  on(ActivityActions.addActivities, (state, { assetActivities }) => {
      const newAssetActivities = Object.keys(assetActivities).reduce((currentAssetActivities, assetId) => {
        if (typeof currentAssetActivities[assetId] === 'undefined' ||
          assetActivities[assetId].occurence > currentAssetActivities[assetId].occurence ||
          assetActivities[assetId].startDate > currentAssetActivities[assetId].startDate
        ) {
          currentAssetActivities[assetId] = assetActivities[assetId];
        }
        return currentAssetActivities;
      }, { ...state.assetActivities });
    return {
      ...state,
      assetActivities: newAssetActivities
    };
  })
);
