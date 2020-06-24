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

  getIncidentsForAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `incident/rest/incident/incidentsForAssetId/${assetId}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  saveNewIncidentStatus(authToken: string, incidentId: number, status: string) {
    return this.http.post(
      environment.baseApiUrl + `incident/rest/incident/updateStatusForIncident/${incidentId}`,
      {
        status,
        eventType: 'INCIDENT_STATUS'
      },
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
