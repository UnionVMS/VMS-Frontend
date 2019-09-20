import { createSelector } from '@ngrx/store';
import * as MobileTerminalInterfaces from './mobile-terminal.interfaces';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectMobileTerminals = (state: State) => state.mobileTerminal.mobileTerminals;

export const getMobileTerminals = createSelector(
  selectMobileTerminals,
  (mobileTerminals: Array<MobileTerminalInterfaces.MobileTerminal>) => {
    return [ ...mobileTerminals ];
  }
);

export const getobileTerminalsForUrlAsset = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    return mobileTerminals.filter(mobileTerminal => mobileTerminal.assetId === mergedRoute.params.assetId);
  }
);
