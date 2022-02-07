import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private readonly http: HttpClient) {}

  getActivities(assetId: string, startDate: string, authToken: string, scopeName: string, roleName: string) {
    const request = {
      searchCriteriaMap : { PERIOD_START : startDate },
      searchCriteriaMapMultipleValues : { PURPOSE : ["9", "5"] },
      showOnlyLatest: true
    }
    if (assetId !== null) {
      request.searchCriteriaMap['VESSEL_GUIDS'] = assetId;
    }
    return this.http.post(
      environment.baseApiUrl + 'activity/rest/fa/list',
      request,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache',
          scopeName,
          roleName
        })
      }
    );
  }
}
