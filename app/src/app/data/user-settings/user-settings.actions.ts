import { createAction, props } from '@ngrx/store';

export const setTimezone = createAction(
  '[UserSettings] Set timezone',
  props<{ timezone: string }>()
);

export const saveTimezone = createAction(
  '[UserSettings] Save timezone',
  props<{ timezone: string }>()
);
