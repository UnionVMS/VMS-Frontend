import { Action, createAction, props } from '@ngrx/store';
import * as IncidentTypes from './incident.types';
import { Note } from '@data/notes/notes.types';

export const clearNotificationsForIncident = createAction(
  '[Incident] clear notification for incident',
  props<{ incident: IncidentTypes.Incident}>()
);

export const createNote = createAction(
  '[Incident] Create note',
  props<{ incidentId: number, note: Note }>()
);

export const getAllOpenIncidents = createAction(
  '[Incident] Get all open incidents'
);

export const getLogForIncident = createAction(
  '[Incident] Get log',
  props<{ incidentId: number }>()
);

export const getIncidentsForAssetId = createAction(
  '[Incident] Get incidents for assetId',
  props<{ assetId: string }>()
);

export const getIncidentTypes = createAction(
  '[Incident] Get incident types'
);

export const getValidIncidentStatusForTypes = createAction(
  '[Incident] Get valid incident status for types'
);

export const pollIncident = createAction(
  '[Incident] Poll asset',
  props<{ incidentId: number, comment?: string }>()
);

export const saveIncident = createAction(
  '[Incident] Save incidents',
  props<{ incident: IncidentTypes.Incident }>()
);

export const selectIncident = createAction(
  '[Incident] Select incident',
  props<{ incidentId: number }>()
);

export const setIncident = createAction(
  '[Incident] Set incident',
  props<{ incident: IncidentTypes.Incident }>()
);

export const setIncidents = createAction(
  '[Incident] Set incidents',
  props<{ incidents: IncidentTypes.IncidentsCollectionByResolution }>()
);

export const setIncidentTypes = createAction(
  '[Incident] Set incident types',
  props<{ incidentTypes: IncidentTypes.IncidentTypesCollection }>()
);

export const setValidIncidentStatusForTypes = createAction(
  '[Incident] Set valid incident status for types'
);

export const setIncidentListForAsset = createAction(
  '[Incident] Set incident list for asset',
  props<{
    assetId: string,
    incidents: { readonly [incidentId: number]: IncidentTypes.Incident }
  }>()
);

export const setLogForIncident = createAction(
  '[Incident] Set log',
  props<{ incidentId: number, incidentLog: IncidentTypes.IncidentLog }>()
);

export const updateIncidents = createAction(
  '[Incident] Update incidents',
  props<{ incidents: { readonly [incidentId: number]: IncidentTypes.Incident } }>()
);
