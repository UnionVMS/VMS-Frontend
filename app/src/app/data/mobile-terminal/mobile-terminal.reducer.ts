import { createReducer, on } from '@ngrx/store';
import * as MobileTerminalActions from './mobile-terminal.actions';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';

export const initialState: MobileTerminalInterfaces.State = {
  mobileTerminals: {},
  transponders: [],
  plugins: [],
  formFieldsValid: {
    serialNumberExists: false,
    memberNumberAndDnidCombinationExists: {},
  },
  searchResults: {},
  lastSearchHash: null,
  createWithSerialNo: null,
};

export const mobileTerminalReducer = createReducer(initialState,
  on(MobileTerminalActions.addMobileTerminals, (state, { mobileTerminals }) => ({
    ...state,
    mobileTerminals: {
      ...state.mobileTerminals,
      ...mobileTerminals
    }
  })),
  on(MobileTerminalActions.addSearchResult, (state, { uniqueHash, mobileTerminalIds }) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      [uniqueHash]: mobileTerminalIds
    },
    lastSearchHash: uniqueHash
  })),
  on(MobileTerminalActions.createWithSerialNo, (state, { serialNo }) => ({
    ...state,
    createWithSerialNo: serialNo
  })),
  on(MobileTerminalActions.setMobileTerminal, (state, { mobileTerminal }) => ({
    ...state,
    mobileTerminals: {
      ...state.mobileTerminals,
      [mobileTerminal.id]: mobileTerminal
    }
  })),
  on(MobileTerminalActions.setTransponders, (state, { transponders }) => ({
    ...state,
    transponders
  })),
  on(MobileTerminalActions.setPlugins, (state, { plugins }) => ({
    ...state,
    plugins
  })),
  on(MobileTerminalActions.getSerialNumberExists, (state) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      serialNumberExists: null,
    }
  })),
  on(MobileTerminalActions.setSerialNumberExists, (state, { serialNumberExists }) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      serialNumberExists
    }
  })),
  on(MobileTerminalActions.getMemberNumberAndDnidCombinationExists, (state, { channelId }) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      memberNumberAndDnidCombinationExists:  {
        ...state.formFieldsValid.memberNumberAndDnidCombinationExists,
        [channelId]: null
      }
    }
  })),
  on(MobileTerminalActions.resetFormFieldValid, (state) => ({
    ...state,
    formFieldsValid: initialState.formFieldsValid
  })),
  on(MobileTerminalActions.setMemberNumberAndDnidCombinationExists, (state, { channelId, dnidMemberNumberComboExists }) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      memberNumberAndDnidCombinationExists:  {
        ...state.formFieldsValid.memberNumberAndDnidCombinationExists,
        [channelId]: dnidMemberNumberComboExists
      }
    }
  })),
);
