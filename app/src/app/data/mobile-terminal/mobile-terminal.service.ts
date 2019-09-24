import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MobileTerminalService {
  constructor(private http: HttpClient) {}

  search(authToken: string, query: object, includeArchived: boolean) {
    return this.http.post(
      environment.baseApiUrl + 'asset/rest/mobileterminal/list?includeArchived=' + includeArchived,
      query,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getMobileTerminal(authToken: string, mobileTerminalId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/' + mobileTerminalId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getTransponders(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/config/MT/transponders', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
