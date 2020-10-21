import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toUTF8Array } from '@app/helpers/helpers';
import { getDefaultHttpOptions } from '@app/helpers/api-request';


@Injectable({
  providedIn: 'root'
})
export class MapSettingsService {

  constructor(private readonly http: HttpClient) {}

  saveMapSettings(authToken: string, preferences) {
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
      getDefaultHttpOptions(authToken)
    );
  }


  getMovementSources(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/config/movementSourceTypes',
      getDefaultHttpOptions(authToken)
    );
  }
}
