import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers/helpers';
import { AuthTypes } from '@data/auth';

import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(private readonly http: HttpClient) {}

  getUserContext(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'usm-administration/rest/userContexts',
      getDefaultHttpOptions(authToken)
    );
  }

  saveMapSettings(user: AuthTypes.User, preferences) {
    return this.saveSetting(user, 'VMSMapSettings', preferences);
  }

  saveUserPreferences(user: AuthTypes.User, preferences) {
    return this.saveSetting(user, 'VMSFrontend', preferences);
  }

  saveMapFilters(user: AuthTypes.User, filters) {
    return this.saveSetting(user, 'VMSMapFilters', filters);
  }

  private saveSetting(user: AuthTypes.User, applicationName, value) {
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
      getDefaultHttpOptions(user.jwtToken.raw)
    );
  }
}
