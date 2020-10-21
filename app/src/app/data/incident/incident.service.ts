import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';

import { getDefaultHttpOptions } from '@app/helpers/api-request';

import { IncidentTypes } from './';
import { AssetTypes } from '@data/asset';
import { NotesTypes } from '@data/notes';


@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  constructor(private readonly http: HttpClient) {}

  getAssetNotSendingEvents(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/assetNotSending`,
      getDefaultHttpOptions(authToken)
    );
  }

  getAllOpenIncidents(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/allOpenIncidents`,
      getDefaultHttpOptions(authToken)
    );
  }

  getLogForIncident(authToken: string, incidentId: number) {
    return this.http.get(
      environment.baseApiUrl + `web-gateway/rest/incidents/incidentLogForIncident/${incidentId}`,
      getDefaultHttpOptions(authToken)
    );
  }

  getIncidentsForAssetId(authToken: string, assetId: string, onlyOpen = false) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/incidentsForAssetId/${assetId}?onlyOpen=${onlyOpen}`,
      getDefaultHttpOptions(authToken)
    );
  }

  getIncidentTypes(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/incidentTypes`,
      getDefaultHttpOptions(authToken)
    );
  }

  getValidIncidentStatusForTypes(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/validStatusForTypes`,
      getDefaultHttpOptions(authToken)
    );
  }

  updateIncidentType(authToken: string, incidentId: number, type: IncidentTypes.IncidentTypes, expiryDate?: number) {
    const body = expiryDate
      ? { incidentId, type, expiryDate }
      : { incidentId, type };

    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentType`,
      body,
      getDefaultHttpOptions(authToken)
    );
  }

  updateIncidentStatus(authToken: string, incidentId: number, status: string, expiryDate?: number) {
    const body = expiryDate
      ? { incidentId, status, expiryDate }
      : { incidentId, status };

    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentStatus`,
      body,
      getDefaultHttpOptions(authToken)
    );
  }

  updateIncidentExpiry(authToken: string, incidentId: number, expiryDate?: number) {
    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentExpiry`,
      { incidentId, expiryDate },
      getDefaultHttpOptions(authToken)
    );
  }

  poll(authToken: string, incidentId: number, comment: string) {
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/incidents/createSimplePollForIncident/${incidentId}`,
      { comment },
      getDefaultHttpOptions(authToken)
    );
  }

  createNote(authToken: string, incidentId: number, note: NotesTypes.Note) {
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/incidents/addNoteToIncident/${incidentId}`,
      note,
      getDefaultHttpOptions(authToken)
    );
  }
}
