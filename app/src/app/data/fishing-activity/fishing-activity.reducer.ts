import { createReducer, on } from '@ngrx/store';
import * as FishingActivityActions from './fishing-activity.actions';
import * as FishingActivityTypes from './fishing-activity.types';

export const initialState: FishingActivityTypes.State = {
};

export const fishingActivityReducer = createReducer(initialState,
);
