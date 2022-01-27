import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';

import { AssetTypes } from '@data/asset';
// import { SimulateMovement } from '@data/asset/tools/movement-simulator';
import { getDefaultHttpOptions } from '@app/helpers/api-request';


@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private mapEventSource: EventSourcePolyfill;
  private mapEventStreamObserver$;

  constructor(private readonly http: HttpClient) {}

  getInitalAssetMovements(authToken: string) {
    return this.http.post(
      environment.baseApiUrl + 'movement/rest/movement/realtime',
      [],
      getDefaultHttpOptions(authToken)
    );
  }

  mapSubscription(authToken: string) {
    this.mapEventSource = new EventSourcePolyfill(environment.baseApiUrl + 'web-gateway/rest/sse/subscribe', {
      headers: {
        Authorization: authToken,
        'Cache-Control': 'no-cache'
      }
    });
    const listener = (event) => {
      if (event.type === 'error') {
        console.error('Map event stream: [Error]', event);
      } else {
        console.log('Map event stream: [' + event.type + '] ', (event.type === 'message' ? event.data : event));
      }
    };
    this.mapEventSource.addEventListener('open', listener);
    this.mapEventSource.addEventListener('message', listener);
    this.mapEventSource.addEventListener('error', listener);

    const that = this;
    return new Observable((observer) => {
      that.mapEventStreamObserver$ = observer;

      const translateMessage = (message) => ({ type: message.type, data: JSON.parse(message.data) });

      that.mapEventSource.addEventListener('Movement', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('Updated Asset', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('Merged Asset', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('Ticket', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('TicketUpdate', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('Incident', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('IncidentUpdate', (message) => observer.next(translateMessage(message)));
      that.mapEventSource.addEventListener('Activity', (message) => observer.next(translateMessage(message)));

      // BUTTERFLY
      // SimulateMovement(observer, '19406db3-0ce8-4e2c-a1c7-ae8a68910827', 3000);
    });
  }

  unsubscribeToMovements() {
    this.mapEventStreamObserver$.complete();
    console.log(
      '-------- We get error here due to the fact that we are closing the connection in ' +
      'the middle of getting new messages.\n' +
      '-------- There seamse to be no way around this and it does not seam to do any harm.'
    );
    this.mapEventSource.close();
  }

  getAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/asset/' + assetId,
      getDefaultHttpOptions(authToken)
    );
  }

  // /unionvms/movement/rest/micro/track/movement/{id}
  getAssetTrack(authToken: string, movementId: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/movement/track/movement/' + movementId,
      getDefaultHttpOptions(authToken)
    );
  }

  // /unionvms/movement/rest/micro/track/asset/{id}/{timestamp}
  getAssetTrackTimeInterval(authToken: string, assetId: string, startDate: number, endDate: number, sources: ReadonlyArray<string>) {
    // const datetime = "2019-03-28 12:00:00 +0100";
    return this.http.post(
      environment.baseApiUrl + `movement/rest/movement/track/asset/${assetId}?startDate=${startDate}&endDate=${endDate}`,
      sources,
      getDefaultHttpOptions(authToken)
    );
  }

  getLicenceForAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${assetId}/licence`,
      getDefaultHttpOptions(authToken)
    );
  }

  getTracksByTimeInterval(authToken: string, query: any, startDate: number, endDate: number, sources: string[]) {
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/reports/tracksByAssetSearch`,
      {
        assetQuery: query,
        sources,
        startDate,
        endDate
      },
      getDefaultHttpOptions(authToken)
    );
  }

  getLastFullPositionsForAsset(authToken: string, assetId: string, amount: number, sources?: string[], excludeGivenSources = false) {
    let postSources = sources || [];
    if(excludeGivenSources) {
      const allSources = ['INMARSAT_C', 'AIS', 'IRIDIUM', 'MANUAL', 'OTHER', 'NAF', 'FLUX'];
      postSources = allSources.filter((source) => !postSources.includes(source));
    }

    return this.http.post(
      environment.baseApiUrl + `movement/rest/movement/track/latest/asset/${assetId}?maxNbr=${amount}`,
      postSources,
      getDefaultHttpOptions(authToken)
    );
  }

  listAssets(authToken: string, searchQuery: AssetTypes.AssetListSearchQuery, includeInactivated?: boolean) {
    let includeInactivatedDefault = true;
    if(typeof includeInactivated !== 'undefined'){
      includeInactivatedDefault = includeInactivated;
    }
    
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/list?includeInactivated=` + includeInactivatedDefault,
      searchQuery,
      getDefaultHttpOptions(authToken)
    );
  }

  getAssetList(authToken: string, listOfAssetIds: ReadonlyArray<string>) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/assetList`,
      listOfAssetIds,
      getDefaultHttpOptions(authToken)
    );
  }

  countAssets(authToken: string, searchQuery: AssetTypes.AssetListSearchQuery) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/listcount/`,
      searchQuery,
      getDefaultHttpOptions(authToken)
    );
  }

  getUnitTonnage(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/customcodes/listcodesforconstant/UNIT_TONNAGE`,
      getDefaultHttpOptions(authToken)
    );
  }

  createAsset(authToken: string, asset: AssetTypes.Asset) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset`,
      asset,
      getDefaultHttpOptions(authToken)
    );
  }

  createManualMovement(authToken: string, manualMovement: AssetTypes.ManualMovement) {
    return this.http.post(
      environment.baseApiUrl + `movement/rest/manualMovement`,
      manualMovement,
      getDefaultHttpOptions(authToken)
    );
  }

  updateAsset(authToken: string, asset: AssetTypes.Asset) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset`,
      asset,
      getDefaultHttpOptions(authToken)
    );
  }

  poll(authToken: string, assetId: string, pollPostObject: AssetTypes.PollPostObject) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/poll/createPollForAsset/${assetId}`,
      pollPostObject,
      getDefaultHttpOptions(authToken)
    );
  }

  getLastPollsForAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `web-gateway/rest/poll/pollsForAsset/${assetId}`,
      getDefaultHttpOptions(authToken)
    );
  }
}
