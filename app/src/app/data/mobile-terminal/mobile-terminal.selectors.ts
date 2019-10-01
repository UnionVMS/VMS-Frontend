import { createSelector } from '@ngrx/store';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectMobileTerminals = (state: State) => state.mobileTerminal.mobileTerminals;
export const selectTransponders = (state: State) => state.mobileTerminal.transponders;
export const selectPlugins = (state: State) => state.mobileTerminal.plugins;


export const getMobileTerminals = createSelector(
  selectMobileTerminals,
  (mobileTerminals: { [id: string ]: MobileTerminalInterfaces.MobileTerminal }) => {
    return { ...mobileTerminals };
  }
);

export const getMobileTerminalsForUrlAsset = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    return Object.values(mobileTerminals).filter(mobileTerminal => mobileTerminal.assetId === mergedRoute.params.assetId);
  }
);

export const getMobileTerminalsByUrl = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    if(typeof mobileTerminals[mergedRoute.params.mobileTerminalId] !== 'undefined') {
      const mobileTerminal = mobileTerminals[mergedRoute.params.mobileTerminalId];
      return {
        ...mobileTerminal,
        plugin: { ...mobileTerminal.plugin },
        channels: [ ...mobileTerminal.channels.map(channel => ({ ...channel }) ) ]
      };
    }
    return undefined;
  }
);

export const getTransponders = createSelector(
  selectTransponders,
  (transponders) => transponders
);

export const getPlugins = createSelector(
  selectPlugins,
  (plugins) => plugins
);
