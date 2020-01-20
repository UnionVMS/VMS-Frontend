import { createReducer, on } from '@ngrx/store';
import * as MobileTerminalActions from './mobile-terminal.actions';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';

export const initialState: MobileTerminalInterfaces.State = {
  mobileTerminals: {},
  transponders: [],
  plugins: [],
  formFieldsValid: { serialNumberExists: false, memberNumberAndDnidCombinationExists: false }
};

export const mobileTerminalReducer = createReducer(initialState,
  on(MobileTerminalActions.addMobileTerminals, (state, { mobileTerminals }) => {
    return ({
      ...state,
      mobileTerminals: {
        ...state.mobileTerminals,
        ...mobileTerminals
      }
    });
  }),
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
  on(MobileTerminalActions.setSerialNumberExists, (state, { serialNumberExists }) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      serialNumberExists
    }
  })),
  on(MobileTerminalActions.setMemberAndDnidCombinationExists, (state, { memberNumberAndDnidCombinationExists }) => ({
    ...state,
    formFieldsValid: {
      ...state.formFieldsValid,
      memberNumberAndDnidCombinationExists
    }
  })),
);
