import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { AssetTypes } from '@data/asset';
import { SimulateMovement } from '@data/asset/tools/movement-simulator';


@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private mapEventSource: EventSourcePolyfill;
  private mapEventStreamObserver$;

  constructor(private readonly http: HttpClient) {}

  getInitalAssetMovements(authToken: string) {
    return this.http.post(
      environment.baseApiUrl + 'movement/rest/micro/latest',
      [],
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
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
        console.warn('Map event stream: [' + event.type + '] ', (event.type === 'message' ? event.data : event));
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
      environment.baseApiUrl + 'asset/rest/asset/' + assetId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  // /unionvms/movement/rest/micro/track/movement/{id}
  getAssetTrack(authToken: string, movementId: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/micro/track/movement/' + movementId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  // /unionvms/movement/rest/micro/track/asset/{id}/{timestamp}
  getAssetTrackTimeInterval(authToken: string, assetId: string, startDate: number, endDate: number, sources: ReadonlyArray<string>) {
    // const datetime = "2019-03-28 12:00:00 +0100";
    return this.http.post(
      environment.baseApiUrl + `movement/rest/micro/track/asset/${assetId}?startDate=${startDate}&endDate=${endDate}`,
      sources,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getLicenceForAsset(authToken: string, assetId: string): Observable<AssetTypes.AssetLicence> {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${assetId}/licence`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    ) as Observable<AssetTypes.AssetLicence>;
  }

  // /unionvms/movement/rest/micro/track/assets
  getTracksByTimeInterval(authToken: string, query: any, startDate: number, endDate: number, sources: string[]) {
    // const datetime = "2019-03-28 12:00:00 +0100";
    return this.http.post(
      environment.baseApiUrl + `web-gateway/rest/reports/tracksByAssetSearch`,
      {
        assetQuery: query,
        sources,
        startDate,
        endDate
      },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
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
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  listAssets(authToken: string, searchQuery: AssetTypes.AssetListSearchQuery) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/list/`,
      searchQuery,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getAssetEssentialProperties(authToken: string, listOfAssetIds: ReadonlyArray<string>) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/microAssets`,
      listOfAssetIds,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getUnitTonnage(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/customcodes/listcodesforconstant/UNIT_TONNAGE`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createAsset(authToken: string, asset: AssetTypes.Asset) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset`,
      asset,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createManualMovement(authToken: string, manualMovement: AssetTypes.ManualMovement) {
    return this.http.post(
      environment.baseApiUrl + `movement/rest/manualMovement`,
      manualMovement,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateAsset(authToken: string, asset: AssetTypes.Asset) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset`,
      asset,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  poll(authToken: string, assetId: string, comment: string) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/poll/createPollForAsset/${assetId}`,
      { comment },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getLatestPollsForAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `web-gateway/rest/poll/pollsForAsset/${assetId}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }
}
