import { createReducer, on } from '@ngrx/store';
import * as MobileTerminalActions from './mobile-terminal.actions';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';

export const initialState: MobileTerminalInterfaces.State = {
  mobileTerminals: [],
};

export const mobileTerminalReducer = createReducer(initialState,
  on(MobileTerminalActions.addMobileTerminals, (state, { mobileTerminals }) => {
    return ({
      ...state,
      mobileTerminals: [
        ...state.mobileTerminals,
        ...mobileTerminals
      ].filter((v, i, a) => { console.warn(a.indexOf(v), i, v); return a.indexOf(v) === i; })
    });
  }),
);
