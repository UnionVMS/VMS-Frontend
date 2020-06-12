import { Action, createReducer, on } from '@ngrx/store';
import * as IncidentActions from './incident.actions';
import * as Types from './incident.types';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Types.State = {
  assetNotSendingIncidents: {},
  incidentNotificationsByType: {
    assetNotSending: {}
  },
  incidentLogs: {}
};

export const incidentReducer = createReducer(initialState,
  on(IncidentActions.setAssetNotSendingIncidents, (state, { assetNotSendingIncidents }) => ({
    ...state,
    assetNotSendingIncidents,
  })),
  on(IncidentActions.updateAssetNotSendingIncidents, (state, { assetNotSendingIncidents, updateType }) => ({
    ...state,
    assetNotSendingIncidents: {
      ...state.assetNotSendingIncidents,
      ...assetNotSendingIncidents
    },
    incidentNotificationsByType: {
      assetNotSending: Object.values(assetNotSendingIncidents).reduce((acc, incident) => {
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
  })),
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
