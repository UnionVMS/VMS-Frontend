import { createAction, props } from '@ngrx/store';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';

export const search = createAction(
  '[Mobile Terminals] search',
  props<{ query: object, includeArchived: boolean }>()
);

export const addMobileTerminals = createAction(
  '[Mobile Terminals] Add',
  props<{ mobileTerminals: { [id: string]: MobileTerminalInterfaces.MobileTerminal } }>()
);

export const setMobileTerminal = createAction(
  '[Mobile Terminals] Set',
  props<{ mobileTerminal: MobileTerminalInterfaces.MobileTerminal }>()
);

export const getMobileTerminals = createAction(
  '[Mobile Terminals] Get list',
  props<{ query: any }>()
);

export const saveMobileTerminal = createAction(
  '[Mobile Terminals] Save',
  props<{ mobileTerminal: MobileTerminalInterfaces.MobileTerminal }>()
);

export const getSelectedMobileTerminal = createAction(
  '[Mobile Terminal] Get selected'
);

export const getTransponders = createAction(
  '[Mobile Terminal] Get Transponsers'
);

export const getPlugins = createAction(
  '[Mobile Terminal] Get Plugins'
);

export const setTransponders = createAction(
  '[Mobile Terminal] Set Transponsers',
  props<{ transponders: Array<MobileTerminalInterfaces.Transponder> }>()
);

export const setPlugins = createAction(
  '[Mobile Terminal] Set Plugins',
  props<{ plugins: Array<MobileTerminalInterfaces.Plugin> }>()
);

export const getIsValidSerialNumber = createAction(
  '[Mobile Terminal] Get is valid serial number'
);
export const setIsValidSerialNumber = createAction(
  '[Mobile Terminal] Set is valid serial number',
  props<{ isSerialNumberValid: boolean }>()
);

export const validateSerialNumber = createAction(
  '[Mobile Terminal] validate serialNumber',
  props<{ serialNumber: string}>()
);
