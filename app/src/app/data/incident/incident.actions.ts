import { Action, createAction, props } from '@ngrx/store';
import * as IncidentInterfaces from './incident.interfaces';

export const clearNotificationsForIncident = createAction(
  '[Incident] clear notification for incident',
  props<{ incident: IncidentInterfaces.assetNotSendingIncident}>()
);

export const getAssetNotSendingIncidents = createAction(
  '[Incident] Get asset not sending incidents'
);

export const saveNewIncidentStatus = createAction(
  '[Incident] Save new incident status',
  props<{ incidentId: number, status: string }>()
);

export const selectIncident = createAction(
  '[Incident] Select incident',
  props<{ incident: IncidentInterfaces.assetNotSendingIncident, incidentType: string }>()
);

export const setAssetNotSendingIncidents = createAction(
  '[Incident] Set asset not sending incidents',
  props<{ assetNotSendingIncidents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident }}>()
);

export const updateAssetNotSendingIncidents = createAction(
  '[Incident] Update asset not sending incidents',
  props<{
    assetNotSendingIncidents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident },
    updateType: IncidentInterfaces.incidentNotificationTypes
  }>()
);
