import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';

import { IncidentTypes } from './';


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

  saveNewIncidentStatus(authToken: string, incidentId: number, status: string) {
    return this.http.post(
      environment.baseApiUrl + `incident/rest/incident/assetNotSending/${incidentId}/status`,
      { status },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
