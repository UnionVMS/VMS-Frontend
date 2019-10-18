import { createAction, props } from '@ngrx/store';

export const setReady = createAction(
  '[Map] Set ready',
  props<{ ready: boolean }>()
);
