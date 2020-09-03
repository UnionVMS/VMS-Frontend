import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Injectable({
  providedIn: 'root'
})

export class MobileTerminalService {
  constructor(private readonly http: HttpClient) {}

  search(authToken: string, query: object, includeArchived: boolean) {
    return this.http.post(
      environment.baseApiUrl + 'asset/rest/mobileterminal/list?includeArchived=' + includeArchived,
      query,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getMobileTerminal(authToken: string, mobileTerminalId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/' + mobileTerminalId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getMobileTerminalHistoryForAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/history/getMtHistoryForAsset/' + assetId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getTransponders(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/config/MT/transponders', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createMobileTerminal(authToken: string, mobileTerminal: MobileTerminalTypes.MobileTerminal) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/mobileterminal`,
      {
        ...mobileTerminal,
        channels: mobileTerminal.channels.map(channel => ({
          ...channel
        }))
      },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateMobileTerminal(authToken: string, mobileTerminal: MobileTerminalTypes.MobileTerminal) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/mobileterminal`,
      mobileTerminal,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getPlugins(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/plugin/plugins', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getSerialNumberExists(authToken: string, serialNr: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/checkIfExists/serialNr/' + serialNr, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getMemberAndDnidCombinationExists(authToken: string, memberNumber: string, dnid: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/checkIfExists/memberNbr/dnid/' + memberNumber + '/' + dnid, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getProposedMemberNumber(authToken: string, dnid: number) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/mobileterminal/lowestFreeMemberNumberForDnid/${dnid}`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

}
