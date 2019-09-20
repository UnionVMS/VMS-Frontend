import { createAction, props } from '@ngrx/store';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';

export const search = createAction(
  '[Mobile Terminals] search',
  props<{ query: object, includeArchived: boolean }>()
);

export const addMobileTerminals = createAction(
  '[Mobile Terminals] Add',
  props<{ mobileTerminals: Array<MobileTerminalInterfaces.MobileTerminal> }>()
);
