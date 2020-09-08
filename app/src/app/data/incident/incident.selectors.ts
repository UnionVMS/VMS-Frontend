import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { IncidentTypes } from './';

export const selectSelectedIncidentId = (state: State) => state.incident.selectedIncidentId;
export const selectIncidents = (state: State) => state.incident.incidents;
export const selectAssetNotSendingIncidents = (state: State) => state.incident.incidentsByTypesAndStatus.assetNotSending;
export const selectIncidentNotificationsByType = (state: State) => state.incident.incidentNotificationsByType;
export const selectIncidentLogs = (state: State) => state.incident.incidentLogs;
export const selectIncidentsForAssets = (state: State) => state.incident.incidentsForAssets;

export const getSelectedIncident = createSelector(
  selectSelectedIncidentId,
  selectIncidents,
  (incidentId, incidents) => incidents[incidentId]
);

export const getAssetNotSendingIncidents = createSelector(
  selectIncidents,
  selectAssetNotSendingIncidents,
  (incidents, assetNotSendingIncidents): IncidentTypes.IncidentsCollectionByResolution => {
    return {
      unresolvedIncidents: assetNotSendingIncidents.unresolvedIncidentIds.map(incidentId => incidents[incidentId]),
      recentlyResolvedIncidents: assetNotSendingIncidents.recentlyResolvedIncidentIds.map(incidentId => incidents[incidentId]),
    };
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

export const getIncidentsForAssets = createSelector(
  selectIncidentsForAssets,
  selectIncidents,
  (incidentsForAssets, incidents) => {
    return Object.keys(incidentsForAssets).reduce((acc, assetId) => ({
      ...acc,
      [assetId]: incidentsForAssets[assetId].map((incidentId: number) => incidents[incidentId])
    }), {});
  }
);
