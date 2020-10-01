import { createAction, props } from '@ngrx/store';
import * as MobileTerminalTypes from './mobile-terminal.types';

export const search = createAction(
  '[Mobile Terminals] search',
  props<{ query: object, includeArchived: boolean, saveAsSearchResult?: boolean }>()
);

export const addMobileTerminals = createAction(
  '[Mobile Terminals] Add',
  props<{ mobileTerminals: { [id: string]: MobileTerminalTypes.MobileTerminal } }>()
);

export const addMobileTerminalHistoryFilters = createAction(
  '[Mobile Terminals] Add history filter',
  props<{ historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter }>()
);

export const addSearchResult = createAction(
  '[Mobile Terminals] Add search result',
  props<{ uniqueHash: number, mobileTerminalIds: ReadonlyArray<string> }>()
);

export const setMobileTerminal = createAction(
  '[Mobile Terminals] Set',
  props<{ mobileTerminal: MobileTerminalTypes.MobileTerminal }>()
);

export const getMobileTerminal = createAction(
  '[Mobile Terminals] Get mobile terminal',
  props<{ mobileTerminalId: string }>()
);

export const getMobileTerminals = createAction(
  '[Mobile Terminals] Get list',
  props<{ query: any }>()
);

export const getMobileTerminalHistoryForAsset = createAction(
  '[Mobile Terminals] Get history for asset',
  props<{ assetId: string }>()
);

export const getProposedMemberNumber = createAction(
  '[Mobile Terminals] Get proposed member number',
  props<{ dnid: number }>()
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

export const saveMobileTerminal = createAction(
  '[Mobile Terminals] Save',
  props<{ mobileTerminal: MobileTerminalTypes.MobileTerminal }>()
);

export const setMobileTerminalHistoryForAsset = createAction(
  '[Mobile Terminals] Set history for asset',
  props<{ mobileTerminalHistory: Readonly<{
    readonly [assetId: string]: MobileTerminalTypes.MobileTerminalHistoryList }>
  }>()
);

export const setProposedMemberNumber = createAction(
  '[Mobile Terminals] Set proposed member number',
  props<{ memberNumber: number }>()
);

export const setTransponders = createAction(
  '[Mobile Terminal] Set Transponsers',
  props<{ transponders: Array<MobileTerminalTypes.Transponder> }>()
);

export const setPlugins = createAction(
  '[Mobile Terminal] Set Plugins',
  props<{ plugins: Array<MobileTerminalTypes.Plugin> }>()
);

export const setSerialNumberExists = createAction(
  '[Mobile Terminal] Set is valid serial number',
  props<{ serialNumberExists: boolean }>()
);

export const getSerialNumberExists = createAction(
  '[Mobile Terminal] validate serialNumber',
  props<{ serialNumber: string, isSelf?: boolean}>()
);

export const setMemberNumberAndDnidCombinationExists = createAction(
  '[Mobile Terminal] Set channel with valid of DNID and memberNumber',
  props<{ channelId: string, dnidMemberNumberComboExists: boolean; }>()
);

export const getMemberNumberAndDnidCombinationExists = createAction(
  '[Mobile Terminal] Get memberNumber and dnid combination exists',
  props<{ memberNumber: number, dnid: number, channelId: string, isSelf?: boolean}>()
);

export const resetFormFieldValid = createAction(
  '[Mobile Terminal] Reset form field valid'
);

export const removeMobileTerminalHistoryFilters = createAction(
  '[Mobile Terminals] Remove history filter',
  props<{ historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter }>()
);

export const createWithSerialNo = createAction(
  '[Mobile Terminal] Create with serial no',
  props<{ serialNo: string | null }>()
);
