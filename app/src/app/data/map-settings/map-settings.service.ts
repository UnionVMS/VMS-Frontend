import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toUTF8Array } from '@app/helpers/helpers';
import { getDefaultHttpOptions } from '@app/helpers/api-request';


@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {

  constructor(private readonly http: HttpClient) {}

  getMovementSources(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/config/movementSourceTypes',
      getDefaultHttpOptions(authToken)
    );
  }
}
