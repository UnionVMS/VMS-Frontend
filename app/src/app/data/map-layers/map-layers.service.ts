import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapLayersService {
  constructor(private http: HttpClient) {}
// spatialSwe/rest/userarea/layers

  getAreas(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'spatialSwe/rest/area/layers', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}