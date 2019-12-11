import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers/helpers';
import { AuthInterfaces } from '@data/auth';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(private http: HttpClient) {}

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

  saveMapSettings(user: AuthInterfaces.User, preferences) {
    return this.saveSetting(user, 'VMSMapSettings', preferences);
  }

  saveUserPreferences(user: AuthInterfaces.User, preferences) {
    return this.saveSetting(user, 'VMSFrontend', preferences);
  }

  saveMapFilters(user: AuthInterfaces.User, filters) {
    return this.saveSetting(user, 'VMSMapFilters', filters);
  }

  private saveSetting(user: AuthInterfaces.User, applicationName, value) {
    const valueAsString = JSON.stringify(value);
    const arrayBuffer = toUTF8Array(valueAsString);

    return this.http.put(
      environment.baseApiUrl + `user/rest/user/putPreference`,
      {
        userName: user.data.username,
        applicationName,
        roleName: user.role.name,
        scopeName: user.scope.name,
        optionName: 'settings',
        optionValue: arrayBuffer // To byte array for some reason...
      },
      {
        headers: new HttpHeaders({
          Authorization: user.jwtToken.raw,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
