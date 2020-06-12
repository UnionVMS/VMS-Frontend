import { Action, createAction, props } from '@ngrx/store';
import * as IncidentTypes from './incident.types';
import { Note } from '@data/notes/notes.types';

export const clearNotificationsForIncident = createAction(
  '[Incident] clear notification for incident',
  props<{ incident: IncidentTypes.assetNotSendingIncident}>()
);

export const createNote = createAction(
  '[Incident] Create note',
  props<{ incidentId: number, note: Note }>()
);

export const getAssetNotSendingIncidents = createAction(
  '[Incident] Get asset not sending incidents'
);

export const getLogForIncident = createAction(
  '[Incident] Get log',
  props<{ incidentId: number }>()
);

export const pollIncident = createAction(
  '[Incident] Poll asset',
  props<{ incidentId: number, comment?: string }>()
);

export const saveNewIncidentStatus = createAction(
  '[Incident] Save new incident status',
  props<{ incidentId: number, status: string }>()
);

export const selectIncident = createAction(
  '[Incident] Select incident',
  props<{ incident: IncidentTypes.assetNotSendingIncident, incidentType: string }>()
);

export const setAssetNotSendingIncidents = createAction(
  '[Incident] Set asset not sending incidents',
  props<{ assetNotSendingIncidents: { readonly [assetId: string]: IncidentTypes.assetNotSendingIncident }}>()
);

export const setLogForIncident = createAction(
  '[Incident] Set log',
  props<{ incidentId: number, incidentLog: IncidentTypes.incidentLog }>()
);

export const updateAssetNotSendingIncidents = createAction(
  '[Incident] Update asset not sending incidents',
  props<{
    assetNotSendingIncidents: { readonly [assetId: string]: IncidentTypes.assetNotSendingIncident },
    updateType: IncidentTypes.incidentNotificationTypes
  }>()
);
