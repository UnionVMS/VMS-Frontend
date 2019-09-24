import { createSelector } from '@ngrx/store';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectMobileTerminals = (state: State) => state.mobileTerminal.mobileTerminals;
export const selectTransponders = (state: State) => state.mobileTerminal.transponders;

export const getMobileTerminals = createSelector(
  selectMobileTerminals,
  (mobileTerminals: Array<MobileTerminalInterfaces.MobileTerminal>) => {
    return [ ...mobileTerminals ];
  }
);

export const getMobileTerminalsForUrlAsset = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    return mobileTerminals.filter(mobileTerminal => mobileTerminal.assetId === mergedRoute.params.assetId);
  }
);

export const getMobileTerminalsByUrl = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    return mobileTerminals.find(mobileTerminal => mobileTerminal.assetId === mergedRoute.params.assetId);
  }
);

export const getTransponders = createSelector(
  selectTransponders,
  (transponders) => transponders
);
