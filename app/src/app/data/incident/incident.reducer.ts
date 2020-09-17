import { Action, createReducer, on } from '@ngrx/store';
import * as IncidentActions from './incident.actions';
import * as Types from './incident.types';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Types.State = {
  selectedIncidentId: null,
  incidents: {},
  incidentsForAssets: {},
  incidentsByTypesAndStatus: {
    assetNotSending: { unresolvedIncidentIds: [], recentlyResolvedIncidentIds: [] },
    manualPositionMode: { unresolvedIncidentIds: [], recentlyResolvedIncidentIds: [] },
    seasonalFishing: { unresolvedIncidentIds: [], recentlyResolvedIncidentIds: [] },
    parked: { unresolvedIncidentIds: [], recentlyResolvedIncidentIds: [] },
    ownershipTransfer: { unresolvedIncidentIds: [], recentlyResolvedIncidentIds: [] },
  },
  incidentLogs: {},
  incidentTypes: [],
};

export const incidentReducer = createReducer(initialState,
  on(IncidentActions.setIncidents, (state, { incidents }) => {
    const filterAndCategorizeByType = (incidentsToSort: Types.IncidentsCollectionByResolution, type: Types.IncidentTypes) => {
      return {
        unresolvedIncidentIds: [
          ...Object.values(incidentsToSort.unresolvedIncidents)
            .filter((incident: Types.Incident) => incident.type === type)
            .map((incident: Types.Incident) => incident.id)
        ],
        recentlyResolvedIncidentIds: [
          ...Object.values(incidentsToSort.recentlyResolvedIncidents)
            .filter((incident: Types.Incident) => incident.type === type)
            .map((incident: Types.Incident) => incident.id)
        ],
      };
    };

    return {
      ...state,
      incidents: {
        ...incidents.unresolvedIncidents,
        ...incidents.recentlyResolvedIncidents
      },
      incidentsByTypesAndStatus: {
        assetNotSending: filterAndCategorizeByType(incidents, Types.IncidentTypes.assetNotSending),
        manualPositionMode: filterAndCategorizeByType(incidents, Types.IncidentTypes.manualPositionMode),
        seasonalFishing: filterAndCategorizeByType(incidents, Types.IncidentTypes.seasonalFishing),
        parked: filterAndCategorizeByType(incidents, Types.IncidentTypes.parked),
        ownershipTransfer: filterAndCategorizeByType(incidents, Types.IncidentTypes.ownershipTransfer),
      }
    };
  }),
  on(IncidentActions.updateIncidents, (state, { incidents }) => {
    const invertedTypes = Types.IncidentTypesInverted;
    return Object.values(incidents).reduce((newState: Types.State, incident) => {
      const incidentPreviousState = state.incidents[incident.id];
      // Remove old instance then add again
      if(
        typeof incidentPreviousState !== 'undefined' &&
        typeof newState.incidentsByTypesAndStatus[invertedTypes[incidentPreviousState.type]] !== 'undefined'
      ) {
        const statusType = incidentPreviousState.status === Types.AssetNotSendingStatuses.RESOLVED
          ? 'recentlyResolvedIncidentIds'
          : 'unresolvedIncidentIds';

        newState = {
          ...newState,
          incidentsByTypesAndStatus: {
            ...newState.incidentsByTypesAndStatus,
            [invertedTypes[incidentPreviousState.type]]: {
              ...newState.incidentsByTypesAndStatus[invertedTypes[incidentPreviousState.type]],
              [statusType]: newState.incidentsByTypesAndStatus[invertedTypes[incidentPreviousState.type]][statusType].filter(
                (incidentId: number) => incidentId !== incidentPreviousState.id
              )
            }
          }
        };
      }

      // Add instance
      const incidentStatusType = incident.status === Types.AssetNotSendingStatuses.RESOLVED
        ? 'recentlyResolvedIncidentIds'
        : 'unresolvedIncidentIds';


      return newState = {
        ...newState,
        incidents: {
          ...newState.incidents,
          [incident.id]: incident
        },

        incidentsByTypesAndStatus: {
          ...newState.incidentsByTypesAndStatus,
          [invertedTypes[incident.type]]: {
            ...newState.incidentsByTypesAndStatus[invertedTypes[incident.type]],
            [incidentStatusType]: [
              ...newState.incidentsByTypesAndStatus[invertedTypes[incident.type]][incidentStatusType],
              incident.id
            ]
          }
        }
      };
    }, { ...state });
  }),
  on(IncidentActions.selectIncident, (state, { incidentId }) => ({
    ...state,
    selectedIncidentId: incidentId
  })),
  on(IncidentActions.setIncidentListForAsset, (state, { assetId, incidents }) => ({
    ...state,
    incidents: {
      ...state.incidents,
      ...incidents
    },
    incidentsForAssets: {
      ...state.incidentsForAssets,
      [assetId]: Object.values(incidents).sort((a, b) => b.updateDate - a.updateDate).map(incident => incident.id)
    }
  })),
  on(IncidentActions.setLogForIncident, (state, { incidentId, incidentLog }) => {
    if(typeof state.incidentLogs[incidentId] === 'undefined') {
      return { ...state, incidentLogs: { ...state.incidentLogs, [incidentId]: incidentLog } };
    }
    return {
      ...state,
      incidentLogs: {
        ...state.incidentLogs,
        [incidentId]: {
          log: { ...state.incidentLogs[incidentId].log, ...incidentLog.log },
          relatedObjects: {
            notes: { ...state.incidentLogs[incidentId].relatedObjects.notes, ...incidentLog.relatedObjects.notes },
            polls: { ...state.incidentLogs[incidentId].relatedObjects.polls, ...incidentLog.relatedObjects.polls },
            positions: { ...state.incidentLogs[incidentId].relatedObjects.positions, ...incidentLog.relatedObjects.positions }
          }
        }
      }
    };
  }),
  on(IncidentActions.setIncidentTypes, (state, { incidentTypes }) => ({
    ...state,
    incidentTypes
  })),
);
