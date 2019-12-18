import { Action, createAction, props } from '@ngrx/store';
import * as IncidentInterfaces from './incident.interfaces';

export const getAssetNotSendingIncidents = createAction(
  '[Asset] Get asset not sending incidents'
);

export const saveNewIncidentStatus = createAction(
  '[Asset] Save new incident status',
  props<{ incidentId: number, status: string }>()
);

export const selectIncident = createAction(
  '[Asset] Select incident',
  props<{ incident: IncidentInterfaces.assetNotSendingIncident, incidentType: string }>()
);

export const setAssetNotSendingIncidents = createAction(
  '[Asset] Set asset not sending incidents',
  props<{ assetNotSendingIncidents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident }}>()
);

export const updateAssetNotSendingIncidents = createAction(
  '[Asset] Update asset not sending incidents',
  props<{ assetNotSendingIncidents: { readonly [assetId: string]: IncidentInterfaces.assetNotSendingIncident }}>()
);
