import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { IncidentTypes } from './';

export const selectSelectedIncidentId = (state: State) => state.incident.selectedIncidentId;
export const selectIncidents = (state: State) => state.incident.incidents;
export const selectAssetNotSendingIncidents = (state: State) => state.incident.incidentsByTypesAndStatus.assetNotSending;
export const selectIncidentsByTypeAndStatus = (state: State) => state.incident.incidentsByTypesAndStatus;
export const selectIncidentLogs = (state: State) => state.incident.incidentLogs;
export const selectIncidentsForAssets = (state: State) => state.incident.incidentsForAssets;
export const selectIncidentTypes = (state: State) => state.incident.incidentTypes;

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

export const getIncidentsByTypeAndStatus = createSelector(
  selectIncidents,
  selectIncidentsByTypeAndStatus,
  (incidents, incidentsByTypeAndStatus): IncidentTypes.IncidentsByTypeAndStatus => {
    return Object.keys(incidentsByTypeAndStatus).reduce((acc, typeName) => {
      return {
        ...acc,
        [typeName]: {
          unresolvedIncidents: incidentsByTypeAndStatus[typeName].unresolvedIncidentIds.map(incidentId => incidents[incidentId]),
          recentlyResolvedIncidents: incidentsByTypeAndStatus[typeName]
            .recentlyResolvedIncidentIds.map(incidentId => incidents[incidentId]),
        }
      };
    }, {} as IncidentTypes.IncidentsByTypeAndStatus);
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

export const getIncidentsForAssets = createSelector(
  selectIncidentsForAssets,
  selectIncidents,
  (incidentsForAssets, incidents): { readonly [assetId: string]: ReadonlyArray<IncidentTypes.Incident> } => {
    return Object.keys(incidentsForAssets).reduce((acc, assetId) => ({
      ...acc,
      [assetId]: incidentsForAssets[assetId].map((incidentId: number) => incidents[incidentId])
    }), {});
  }
);

export const getIncidentTypes = createSelector(
  selectIncidentTypes,
  (incidentTypes) => incidentTypes
);
