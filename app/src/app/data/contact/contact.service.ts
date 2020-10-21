import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContactTypes } from '@data/contact';
import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})

export class ContactService {
  constructor(private readonly http: HttpClient) {}

  getContactById(authToken: string, contactId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/contact/${ contactId }`,
      getDefaultHttpOptions(authToken)
    );
  }

  getContactsFromAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${ assetId }/contacts`,
      getDefaultHttpOptions(authToken)
    );
  }

  updateContact(authToken: string, contact: ContactTypes.Contact) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset/contacts`,
      contact,
      getDefaultHttpOptions(authToken)
    );
  }

  createContact(authToken: string, contact: ContactTypes.Contact) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/contacts`,
      contact,
      getDefaultHttpOptions(authToken)
    );
  }
}
