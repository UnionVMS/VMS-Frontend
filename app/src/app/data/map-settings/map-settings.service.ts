import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toUTF8Array } from '@app/helpers/helpers';


@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {

  constructor(private readonly http: HttpClient) {}

  saveMapSettings(authToken, preferences) {
    const preferencesAsString = JSON.stringify(preferences);
    const arrayBuffer = toUTF8Array(preferencesAsString);

    return this.http.put(
      environment.baseApiUrl + `user/rest/user/putPreference`,
      {
        userName: 'vms_admin_se',
        applicationName: 'VMSMapSettings',
        roleName: 'AdminAllUVMS',
        scopeName: 'All Vessels',
        optionName: 'settings',
        optionValue: arrayBuffer
      },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }


  getMovementSources(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/config/movementSourceTypes',
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
