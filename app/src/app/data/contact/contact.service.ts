import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContactInterfaces } from '@data/contact';

@Injectable({
  providedIn: 'root'
})

export class ContactService {
  constructor(private http: HttpClient) {}

  getContactById(authToken: string, contactId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset2/contact/${ contactId }`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getContactsFromAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${ assetId }/contacts`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}