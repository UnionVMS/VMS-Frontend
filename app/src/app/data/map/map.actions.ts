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

export const setGivenFilterActive = createAction(
  '[Map] Set given filter active',
  props<{ filterTypeName: string, status: boolean }>()
);

export const setActiveLeftPanel = createAction(
  '[Map] Set active left panel',
  props<{ activeLeftPanel: string }>()
);
