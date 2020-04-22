import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(username, password) {
    return this.http.post(
      environment.baseApiUrl + 'usm-administration/rest/authenticate',
      { userName: username, password}
    );
  }

  getUserContext(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'usm-administration/rest/userContexts', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
