import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers/helpers';
import { AuthTypes } from '@data/auth';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})
export class MapSavedFiltersService {

  constructor(private readonly http: HttpClient) {}

  create(authToken: string, filter: MapSavedFiltersTypes.SavedFilter) {
    return this.http.post(
      environment.baseApiUrl + 'asset/rest/filter',
      filter,
      getDefaultHttpOptions(authToken)
    );
  }

  update(authToken: string, filter: MapSavedFiltersTypes.SavedFilter) {
    return this.http.put(
      environment.baseApiUrl + 'asset/rest/filter',
      filter,
      getDefaultHttpOptions(authToken)
    );
  }

  list(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/filter/list',
      getDefaultHttpOptions(authToken)
    );
  }

  delete(authToken: string, filterId: string) {
    return this.http.delete(
      environment.baseApiUrl + `asset/rest/filter/${filterId}`,
      getDefaultHttpOptions(authToken)
    );
  }
}
