import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Injectable({
  providedIn: 'root'
})

export class FishingActivityService {
  constructor(private readonly http: HttpClient) {}

  search(authToken: string, query: object) {
    return this.http.get(
      environment.baseErsApiUrl + 'fishing-reports?username=fisfri',
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
