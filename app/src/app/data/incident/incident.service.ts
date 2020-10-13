import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';

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
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getAllOpenIncidents(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/allOpenIncidents`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getLogForIncident(authToken: string, incidentId: number) {
    return this.http.get(
      environment.baseApiUrl + `web-gateway/rest/incidents/incidentLogForIncident/${incidentId}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getIncidentsForAssetId(authToken: string, assetId: string, onlyOpen = false) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/incidentsForAssetId/${assetId}?onlyOpen=${onlyOpen}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getIncidentTypes(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/incidentTypes`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getValidIncidentStatusForTypes(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/validStatusForTypes`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateIncidentType(authToken: string, incidentId: number, type: IncidentTypes.IncidentTypes, expiryDate?: number) {
    const body = expiryDate
      ? { incidentId, type, expiryDate }
      : { incidentId, type };

    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentType`,
      body,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateIncidentStatus(authToken: string, incidentId: number, status: string, expiryDate?: number) {
    const body = expiryDate
      ? { incidentId, status, expiryDate }
      : { incidentId, status };

    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentStatus`,
      body,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateIncidentExpiry(authToken: string, incidentId: number, expiryDate?: number) {
    return this.http.put(
      environment.baseApiUrl + `web-gateway/rest/incidents/updateIncidentExpiry`,
      { incidentId, expiryDate },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  poll(authToken: string, incidentId: number, comment: string) {
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/incidents/createSimplePollForIncident/${incidentId}`,
      { comment },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createNote(authToken: string, incidentId: number, note: NotesTypes.Note) {
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/incidents/addNoteToIncident/${incidentId}`,
      note,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
