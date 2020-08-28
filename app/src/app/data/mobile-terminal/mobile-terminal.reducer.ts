import { createReducer, on } from '@ngrx/store';
import * as MobileTerminalActions from './mobile-terminal.actions';
import * as MobileTerminalTypes from './mobile-terminal.types';

export const initialState: MobileTerminalTypes.State = {
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
  mobileTerminalHistoryForAsset: {},
  mobileTerminalHistoryFilter: {
    mobileTerminalFields: [
      'serialNo', 'active', 'mobileTerminalType', 'eastAtlanticOceanRegion', 'indianOceanRegion',
      'pacificOceanRegion', 'westAtlanticOceanRegion', 'transceiverType', 'satelliteNumber',
      'softwareVersion', 'antenna', 'installDate', 'installedBy', 'uninstallDate', 'archived', 'assetId'
    ],
    filterChannels: true,
    channelFields: [
      'dnid', 'memberNumber', 'name', 'lesDescription',
      'startDate', 'endDate', 'lesDescription',
      'active', 'archived', 'configChannel', 'defaultChannel', 'pollChannel',
      'expectedFrequency', 'expectedFrequencyInPort', 'frequencyGracePeriod',
    ]
  }
};

export const allMobileTerminalFields = [
  'active', 'mobileTerminalType', 'eastAtlanticOceanRegion', 'indianOceanRegion',
  'pacificOceanRegion', 'westAtlanticOceanRegion', 'transceiverType', 'satelliteNumber',
  'softwareVersion', 'antenna', 'installDate', 'installedBy', 'uninstallDate', 'archived', 'assetId'
];

export const allChannelFields = [
  'dnid', 'memberNumber', 'name', 'lesDescription',
  'startDate', 'endDate',
  'active', 'archived', 'configChannel', 'defaultChannel', 'pollChannel',
  'expectedFrequency', 'expectedFrequencyInPort', 'frequencyGracePeriod'
];


export const mobileTerminalReducer = createReducer(initialState,
  on(MobileTerminalActions.addMobileTerminals, (state, { mobileTerminals }) => ({
    ...state,
    mobileTerminals: {
      ...state.mobileTerminals,
      ...mobileTerminals
    }
  })),
  on(MobileTerminalActions.addMobileTerminalHistoryFilters, (state, { historyFilter }) => {
    let mobileTerminalHistoryFilter = { ...state.mobileTerminalHistoryFilter };
    if(typeof historyFilter.mobileTerminalFields !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        mobileTerminalFields: state.mobileTerminalHistoryFilter.mobileTerminalFields.concat(
          historyFilter.mobileTerminalFields.filter(
            (field: string) => !state.mobileTerminalHistoryFilter.mobileTerminalFields.includes(field)
          )
        )
      };
    }
    if(typeof historyFilter.filterChannels !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        filterChannels: historyFilter.filterChannels
      };
    }
    if(typeof historyFilter.channelFields !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        channelFields: state.mobileTerminalHistoryFilter.channelFields.concat(
          historyFilter.channelFields.filter(
            (field: string) => !state.mobileTerminalHistoryFilter.channelFields.includes(field)
          )
        )
      };
    }
    return {
      ...state,
      mobileTerminalHistoryFilter
    };
  }),
  on(MobileTerminalActions.removeMobileTerminalHistoryFilters, (state, { historyFilter }) => {
    let mobileTerminalHistoryFilter = { ...state.mobileTerminalHistoryFilter };
    if(typeof historyFilter.mobileTerminalFields !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        mobileTerminalFields: state.mobileTerminalHistoryFilter.mobileTerminalFields.filter(
          (field: string) => !historyFilter.mobileTerminalFields.includes(field)
        )
      };
    }
    if(typeof historyFilter.filterChannels !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        filterChannels: historyFilter.filterChannels
      };
    }
    if(typeof historyFilter.channelFields !== 'undefined') {
      mobileTerminalHistoryFilter = {
        ...mobileTerminalHistoryFilter,
        channelFields: state.mobileTerminalHistoryFilter.channelFields.filter(
          (field: string) => !historyFilter.channelFields.includes(field)
        )
      };
    }
    return {
      ...state,
      mobileTerminalHistoryFilter
    };
  }),
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
  on(MobileTerminalActions.setMobileTerminalHistoryForAsset, (state, { mobileTerminalHistory }) => ({
    ...state,
    mobileTerminalHistoryForAsset: {
      ...state.mobileTerminalHistoryForAsset,
      ...mobileTerminalHistory
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
