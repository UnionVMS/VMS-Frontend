import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MobileTerminalTypes } from '@data/mobile-terminal';
import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})

export class MobileTerminalService {
  constructor(private readonly http: HttpClient) {}

  search(authToken: string, query: object, includeArchived: boolean) {
    return this.http.post(
      environment.baseApiUrl + 'asset/rest/mobileterminal/list?includeArchived=' + includeArchived,
      query,
      getDefaultHttpOptions(authToken)
    );
  }

  getMobileTerminal(authToken: string, mobileTerminalId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/' + mobileTerminalId,
      getDefaultHttpOptions(authToken)
    );
  }

  getMobileTerminalHistoryForAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/history/getMtHistoryForAsset/' + assetId,
      getDefaultHttpOptions(authToken)
    );
  }

  getMobileTerminalHistory(authToken: string, mobileTerminalId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/mobileterminal/${mobileTerminalId}/changeHistory/`,
      getDefaultHttpOptions(authToken)
    );
  }

  getTransponders(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/config/MT/transponders',
      getDefaultHttpOptions(authToken)
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
      getDefaultHttpOptions(authToken)
    );
  }

  updateMobileTerminal(authToken: string, mobileTerminal: MobileTerminalTypes.MobileTerminal) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/mobileterminal`,
      mobileTerminal,
      getDefaultHttpOptions(authToken)
    );
  }

  getPlugins(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/plugin/plugins',
      getDefaultHttpOptions(authToken)
    );
  }

  getSerialNumberExists(authToken: string, serialNr: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/checkIfExists/serialNr/' + serialNr,
      getDefaultHttpOptions(authToken)
    );
  }

  getMemberAndDnidCombinationExists(authToken: string, memberNumber: string, dnid: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/checkIfExists/memberNbr/dnid/' + memberNumber + '/' + dnid,
      getDefaultHttpOptions(authToken)
    );
  }

  getProposedMemberNumber(authToken: string, dnid: number) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/mobileterminal/lowestFreeMemberNumberForDnid/${dnid}`,
      getDefaultHttpOptions(authToken)
    );
  }

  getAssetHistoryForMT(authToken: string, mobileTerminalId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/mobileterminal/history/getAssetHistoryForMT/' + mobileTerminalId,
      getDefaultHttpOptions(authToken)
    );
  }
}
