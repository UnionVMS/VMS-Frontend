import { createAction, props } from '@ngrx/store';

export const setTimezone = createAction(
  '[UserSettings] Set timezone',
  props<{ timezone: string, save?: boolean }>()
);

export const setExperimentalFeaturesEnabled = createAction(
  '[UserSettings] Set experimental features enabled',
  props<{ experimentalFeaturesEnabled: boolean, save?: boolean }>()
);
