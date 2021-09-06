import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})
export class MapLayersService {
  constructor(private readonly http: HttpClient) {}
// spatialSwe/rest/userarea/layers

  getAreas(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'spatialSwe/rest/area/layers',
      getDefaultHttpOptions(authToken)
    );
  }

  getUserAreas(authToken: string, scopeName: string, roleName: string) {
    return this.http.get(
      environment.baseApiUrl + 'spatialSwe/rest/userarea/layers/distinctAreaGroups?scopeName=' + scopeName,
      getDefaultHttpOptions(authToken)
    );
  }

  getWMSCapabilities(authToken: string) {
    return this.http.get(
      environment.baseGeoUrl + 'ows?service=wms&version=1.3.0&request=GetCapabilities',
      {
        headers: new HttpHeaders({
          Authorization: authToken
        }),
        responseType: 'text'
      }
    );
  }
}
