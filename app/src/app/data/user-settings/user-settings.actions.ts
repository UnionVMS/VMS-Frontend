import { createAction, props } from '@ngrx/store';

export const setTimezone = createAction(
  '[UserSettings] Set timezone',
  props<{ timezone: string, save?: boolean }>()
);
