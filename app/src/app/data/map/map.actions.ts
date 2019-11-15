import { createAction, props } from '@ngrx/store';

export const setReady = createAction(
  '[Map] Set ready',
  props<{ ready: boolean }>()
);

export const setMapSettingsLoaded = createAction(
  '[Map] Set map settings loaded',
  props<{ mapSettingsLoaded: boolean }>()
);
