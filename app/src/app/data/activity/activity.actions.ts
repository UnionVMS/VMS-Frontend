import { createAction, props } from '@ngrx/store';
import * as ActivityType from './activity.types';

export const addActivities = createAction(
  '[Activity] Add activities',
  props<{ assetActivities: { [assetId: string]: ActivityType.Activity } }>()
);

export const getInitialActivities = createAction(
  '[Activity] Get initial activities'
);
