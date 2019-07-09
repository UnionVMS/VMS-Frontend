import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { toUTF8Array } from '@app/helpers';


@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {

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
    const preferencesAsString = JSON.stringify(preferences);
    const arrayBuffer = toUTF8Array(preferencesAsString);

    return this.http.put(
      environment.baseApiUrl + `user/rest/user/putPreference`,
      {
        userName: 'vms_admin_se',
        applicationName: 'VMSFrontend',
        roleName: 'AdminAllUVMS',
        scopeName: 'All Vessels',
        optionName: 'settings',
        optionValue: arrayBuffer// 'Y2VwYQ==' // [ ...Buffer.from() ] // To byte array for some reason...
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
