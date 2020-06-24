import { Action, createReducer, on } from '@ngrx/store';
import * as IncidentActions from './incident.actions';
import * as Types from './incident.types';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Types.State = {
  selectedIncidentId: null,
  incidents: {},
  incidentsForAssets: {},
  assetNotSendingIncidents: {
    unresolvedIncidentIds: [],
    recentlyResolvedIncidentIds: []
  },
  incidentNotificationsByType: {
    assetNotSending: {}
  },
  incidentLogs: {}
};

export const resolvedStatuses = [
  'RESOLVED',
  'LONG_TERM_PARKED'
];

export const incidentReducer = createReducer(initialState,
  on(IncidentActions.setAssetNotSendingIncidents, (state, {
    unresolved,
    recentlyResolved
  }) => ({
    ...state,
    incidents: {
      ...state.incidents,
      ...unresolved,
      ...recentlyResolved
    },
    assetNotSendingIncidents: {
      unresolvedIncidentIds: [ ...Object.values(unresolved).map((incident: Types.Incident) => incident.id) ],
      recentlyResolvedIncidentIds: [ ...Object.values(recentlyResolved).map((incident: Types.Incident) => incident.id) ]
    }
  })),
  on(IncidentActions.updateAssetNotSendingIncidents, (state, { incidents, updateType }) => {
    let newState = {
      ...state,
      incidents: {
        ...state.incidents,
        ...incidents
      }
    };

    if(updateType === Types.incidentNotificationTypes.updated) {
      newState = {
        ...newState,
        assetNotSendingIncidents: Object.values(incidents).reduce((acc, incident) => {
          const previousIncidentState = state.incidents[incident.id];
          if(typeof previousIncidentState === 'undefined') {
            if(resolvedStatuses.includes(incident.status)) {
              return {
                ...acc,
                recentlyResolvedIncidentIds: [ ...acc.recentlyResolvedIncidentIds, incident.id ]
              };
            } else {
              return {
                ...acc,
                unresolvedIncidentIds: [ ...acc.unresolvedIncidentIds, incident.id ]
              };
            }
          } else if(!resolvedStatuses.includes(previousIncidentState.status) && resolvedStatuses.includes(incident.status)) {
            return {
              unresolvedIncidentIds: acc.unresolvedIncidentIds.filter(id => id !== incident.id),
              recentlyResolvedIncidentIds: [ ...acc.recentlyResolvedIncidentIds, incident.id ]
            };
          } else if(resolvedStatuses.includes(previousIncidentState.status) && !resolvedStatuses.includes(incident.status)) {
            return {
              unresolvedIncidentIds: [ ...acc.unresolvedIncidentIds, incident.id ],
              recentlyResolvedIncidentIds: acc.recentlyResolvedIncidentIds.filter(id => id !== incident.id)
            };
          }
          return acc;
        }, state.assetNotSendingIncidents)
      };
    } else {
      newState = {
        ...newState,
        assetNotSendingIncidents: Object.values(incidents).reduce((acc, incident) => {
          if(resolvedStatuses.includes(incident.status)) {
            return {
              ...acc,
              recentlyResolvedIncidentIds: [ ...acc.recentlyResolvedIncidentIds, incident.id ]
            };
          } else {
            return {
              ...acc,
              unresolvedIncidentIds: [ ...acc.unresolvedIncidentIds, incident.id ]
            };
          }
          return acc;
        }, state.assetNotSendingIncidents)
      };
    }
    return {
      ...newState,
      incidentNotificationsByType: {
        assetNotSending: Object.values(incidents).reduce((acc, incident) => {
          if(typeof acc[incident.id] === 'undefined') {
            return { ...acc,
              [incident.id]: {
                created: updateType === Types.incidentNotificationTypes.created ? 1 : 0,
                updated: updateType === Types.incidentNotificationTypes.updated ? 1 : 0
              }
            };
          } else {
            return { ...acc,
              [incident.id]: { ...acc[incident.id],
                created: updateType === Types.incidentNotificationTypes.created
                  ? acc[incident.id].created + 1
                  : acc[incident.id].created,
                updated: updateType === Types.incidentNotificationTypes.updated
                  ? acc[incident.id].updated + 1
                  : acc[incident.id].updated,
              }
            };
          }
        }, state.incidentNotificationsByType.assetNotSending)
      }
    };
  }),
  on(IncidentActions.clearNotificationsForIncident, (state, { incident }) => ({
    ...state,
    incidentNotificationsByType: Object.keys(state.incidentNotificationsByType).reduce((acc, type) => {
      acc[type] = Object.keys(state.incidentNotificationsByType[type]).reduce((incidentNotifications, incidentId) => {
        if(parseInt(incidentId, 10) !== incident.id) {
          incidentNotifications[incidentId] = state.incidentNotificationsByType[type][incidentId];
        }
        return incidentNotifications;
      }, {});
      return acc;
    }, {})
  })),
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
  })
);
