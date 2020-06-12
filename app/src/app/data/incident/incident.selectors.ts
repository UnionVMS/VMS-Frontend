import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '@app/app-reducer';


export const selectAssetNotSendingIncidents = (state: State) => state.incident.assetNotSendingIncidents;
export const selectIncidentNotificationsByType = (state: State) => state.incident.incidentNotificationsByType;
export const selectIncidentLogs = (state: State) => state.incident.incidentLogs;

export const getAssetNotSendingIncidents = createSelector(
  selectAssetNotSendingIncidents,
  (assetNotSendingIncidents) => {
    return Object.values(assetNotSendingIncidents);
  }
);

export const getAssetNotSendingIncidentsByAssetId = createSelector(
  selectAssetNotSendingIncidents,
  (assetNotSendingIncidents) => assetNotSendingIncidents
);

export const getIncidentLogs = createSelector(
  selectIncidentLogs,
  (incidentLogs) => incidentLogs
);

export const getIncidentNotificationsByType = createSelector(
  selectIncidentNotificationsByType,
  (incidentNotificationsByType) => incidentNotificationsByType
);
