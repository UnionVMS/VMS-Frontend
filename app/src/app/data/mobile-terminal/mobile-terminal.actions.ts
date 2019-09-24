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

export const setMobileTerminal = createAction(
  '[Mobile Terminals] Set',
  props<{ mobileTerminal: MobileTerminalInterfaces.MobileTerminal }>()
);

export const getSelectedMobileTerminal = createAction(
  '[Mobile Terminal] Get selected'
);

export const getTransponders = createAction(
  '[Mobile Terminal] Get Transponsers'
);

export const setTransponders = createAction(
  '[Mobile Terminal] Set Transponsers',
  props<{ transponders: Array<MobileTerminalInterfaces.Transponder> }>()
);
