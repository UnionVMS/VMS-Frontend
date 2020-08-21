import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Injectable({
  providedIn: 'root'
})

export class FishingReportService {
  constructor(private readonly http: HttpClient) {}

  search(authToken: string, query: { username: string }) {
    return this.http.get(
      environment.baseErsApiUrl + 'fishing-reports?username=' + query.username,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getFishingReport(authToken: string, fishingReportId: string) {
    return this.http.get(
      environment.baseErsApiUrl + `fishing-reports/${fishingReportId}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
