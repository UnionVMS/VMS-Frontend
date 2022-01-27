import { createSelector } from '@ngrx/store';
import * as ActivityTypes from './activity.types';
import { State } from '@app/app-reducer';

export const selectAssetActivity = (state: State) => state.activity.assetActivities;

export const getAssetActivities = createSelector(
  selectAssetActivity,
  (assetActivities: { [assetId: string]: ActivityTypes.Activity }) => assetActivities
);
