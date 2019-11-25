import { createAction, props } from '@ngrx/store';

export const setReady = createAction(
  '[Map] Set ready',
  props<{ ready: boolean }>()
);

export const setMapSettingsLoaded = createAction(
  '[Map] Set map settings loaded',
  props<{ mapSettingsLoaded: boolean }>()
);

export const setReportSearching = createAction(
  '[Map] Set report searching',
  props<{ searching: boolean }>()
);
