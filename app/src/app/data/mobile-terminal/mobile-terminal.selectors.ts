import { createSelector } from '@ngrx/store';
import * as MobileTerminalTypes from './mobile-terminal.types';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectMobileTerminals = (state: State) => state.mobileTerminal.mobileTerminals;
export const selectMobileTerminalHistoryForAsset = (state: State) => state.mobileTerminal.mobileTerminalHistoryForAsset;
export const selectTransponders = (state: State) => state.mobileTerminal.transponders;
export const selectPlugins = (state: State) => state.mobileTerminal.plugins;
export const selectSerialNumberExists = (state: State) => state.mobileTerminal.formFieldsValid.serialNumberExists;
export const selectMemberNumberAndDnidCombinationExists = (state: State) =>
  state.mobileTerminal.formFieldsValid.memberNumberAndDnidCombinationExists;
export const selectSearchResults = (state: State) => state.mobileTerminal.searchResults;
export const selectLastSearchHash = (state: State) => state.mobileTerminal.lastSearchHash;
export const selectCreateWithSerialNo = (state: State) => state.mobileTerminal.createWithSerialNo;
export const selectMobileTerminalHistoryFilter = (state: State) => state.mobileTerminal.mobileTerminalHistoryFilter;


export const getCreateWithSerialNo = createSelector(selectCreateWithSerialNo, (createWithSerialNo) => createWithSerialNo);

export const getMobileTerminals = createSelector(
  selectMobileTerminals,
  (mobileTerminals: { [id: string ]: MobileTerminalTypes.MobileTerminal }) => {
    return { ...mobileTerminals };
  }
);

export const getMobileTerminalHistoryFilter = createSelector(
  selectMobileTerminalHistoryFilter,
  (mobileTerminalHistoryFilter) => {
    return mobileTerminalHistoryFilter;
  }
);

export const getMobileTerminalsForUrlAsset = createSelector(
  selectMobileTerminals,
  getMergedRoute,
  (mobileTerminals, mergedRoute) => {
    return Object.values(mobileTerminals).filter(mobileTerminal => mobileTerminal.assetId === mergedRoute.params.assetId);
  }
);

export const getMobileTerminalHistoryForUrlAsset = createSelector(
  selectMobileTerminalHistoryForAsset,
  getMergedRoute,
  (mobileTerminalHistoryForAsset, mergedRoute) => {
    return mobileTerminalHistoryForAsset[mergedRoute.params.assetId] || {};
  }
);

export const getMobileTerminalHistoryFilteredForUrlAsset = createSelector(
  getMobileTerminalHistoryForUrlAsset,
  selectMobileTerminalHistoryFilter,
  (mobileTerminalHistory, filter) => {
    console.warn(mobileTerminalHistory);
    return Object.keys(mobileTerminalHistory).filter((historyId: string) => {
      const history = mobileTerminalHistory[historyId];
      if(history.changes.find(change => filter.mobileTerminalFields.includes(change.field))) {
        return true;
      }
      if(filter.filterChannels) {
        const channelChangesArray = Object.values(history.channelChanges);
        if(channelChangesArray.find(channelChange =>
          channelChange.changeType === MobileTerminalTypes.MobileTerminalChannelChangeType.CREATED ||
          channelChange.changeType === MobileTerminalTypes.MobileTerminalChannelChangeType.REMOVED
        )) {
          return true;
        }
        if(channelChangesArray.find(channelChange => channelChange.changes.find(change => filter.channelFields.includes(change.field)))) {
          return true;
        }
      }
      return false;
    }).reduce((acc, historyId) => {
      return { ...acc, [historyId]: mobileTerminalHistory[historyId] };
    }, {});
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

export const getSerialNumberExists = createSelector(
  selectSerialNumberExists,
  (serialNumberExists) => serialNumberExists
);

export const getMemberNumberAndDnidCombinationExists = createSelector(
  selectMemberNumberAndDnidCombinationExists,
  (memberNumberAndDnidCombinationExists) => memberNumberAndDnidCombinationExists
);


export const getLastSearchResult = createSelector(
  selectSearchResults, selectLastSearchHash, selectMobileTerminals,
  (searchResults, lastSearchHash, mobileTerminals) => typeof searchResults[lastSearchHash] !== 'undefined'
    ? searchResults[lastSearchHash].map(mobileTerminalId => mobileTerminals[mobileTerminalId])
    : undefined
);
