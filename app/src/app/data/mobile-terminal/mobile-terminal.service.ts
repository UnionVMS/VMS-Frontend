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
}
