import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers/helpers';


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

  saveUserPreferences(authToken, preferences) {
    return this.saveSetting(authToken, 'VMSFrontend', preferences);
  }

  saveMapFilters(authToken, filters) {
    return this.saveSetting(authToken, 'VMSMapFilters', filters);
  }

  private saveSetting(authToken, applicationName, value) {
    const valueAsString = JSON.stringify(value);
    const arrayBuffer = toUTF8Array(valueAsString);

    return this.http.put(
      environment.baseApiUrl + `user/rest/user/putPreference`,
      {
        userName: 'vms_admin_se',
        applicationName,
        roleName: 'AdminAllUVMS',
        scopeName: 'All Vessels',
        optionName: 'settings',
        optionValue: arrayBuffer // To byte array for some reason...
      },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
