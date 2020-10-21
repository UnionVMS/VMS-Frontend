import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post(
      environment.baseApiUrl + 'usm-administration/rest/authenticate',
      { userName: username, password}
    );
  }

  getUserContext(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'usm-administration/rest/userContexts',
      getDefaultHttpOptions(authToken)
    );
  }
}
