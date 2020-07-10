import { createAction, props } from '@ngrx/store';
import * as FishingActivityTypes from './fishing-activity.types';

export const search = createAction(
  '[Fishing activity] search',
  props<{ query: object }>()
);
