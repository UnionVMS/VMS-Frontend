import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers/helpers';
import { AuthTypes } from '@data/auth';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';

@Injectable({
  providedIn: 'root'
})
export class MapSavedFiltersService {

  constructor(private http: HttpClient) {}

  create(authToken: string, filter: MapSavedFiltersTypes.SavedFilter) {
    return this.http.post(
      environment.baseApiUrl + 'asset/rest/filter',
      filter,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  update(authToken: string, filter: MapSavedFiltersTypes.SavedFilter) {
    return this.http.put(
      environment.baseApiUrl + 'asset/rest/filter',
      filter,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  list(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/filter/list', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  delete(authToken: string, filterId: string) {
    return this.http.delete(
      environment.baseApiUrl + `asset/rest/filter/${filterId}`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
