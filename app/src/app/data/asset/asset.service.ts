import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable } from 'rxjs';

import { AssetInterfaces } from '@data/asset';


@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private mapEventSource: EventSourcePolyfill;
  private mapEventStreamObserver$;

  constructor(private http: HttpClient) {}

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
    this.mapEventSource = new EventSourcePolyfill(environment.baseApiUrl + 'stream-collector/rest/sse/subscribe', {
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
      that.mapEventSource.addEventListener('TicketUpdate', (message) => observer.next(observer.next(translateMessage(message))));
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

  getAssetGroups(authToken: string, userName: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/group/list?user=' + userName, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  // /unionvms/movement/rest/micro/track/movement/{guid}
  getAssetTrack(authToken: string, movementGuid: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/micro/track/movement/' + movementGuid, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  // /unionvms/movement/rest/micro/track/asset/{id}/{timestamp}
  getAssetTrackTimeInterval(authToken: string, assetId: string, startDate: string, endDate) {
    // const datetime = "2019-03-28 12:00:00 +0100";
    return this.http.post(
      environment.baseApiUrl + `movement/rest/micro/track/asset/${assetId}?startDate=${startDate}&endDate=${endDate}`,
      [],
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  // /unionvms/movement/rest/micro/track/assets
  getTracksByTimeInterval(authToken: string, assetIds: string[], startDate: string, endDate: string, sources: string[]) {
    // const datetime = "2019-03-28 12:00:00 +0100";
    return this.http.post(
      environment.baseApiUrl + `movement/rest/micro/track/assets?startDate=${startDate}&endDate=${endDate}`,
      { assetIds, sources },
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  listAssets(authToken: string, searchQuery) {
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

  getAssetEssentialProperties(authToken: string, listOfAssetIds) {
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

  getAssetNotSendingEvents(authToken: string) {
    return new Observable((observer) => {
      observer.next([
        {
          id: 'blubb-blubb-blubb-Ship5XXX',
          assetName: 'Ship5XXX',
          assetId: '03bb12a0-79e4-4a70-a376-6a5d450fc096',
          assetIrcs: 'F5XXX',
          lastKnownLocation: {
            location: {
              longitude: 11.640111666666667,
              latitude: 57.40071666666667,
              altitude: null
            },
            heading: 225,
            guid: '70aa09c3-a68f-4c7e-a828-ef658fbe7b45',
            timestamp: '2019-11-22T04:21:30Z',
            speed: 102.30000305175781,
            source: 'INMARSAT_C'
          },
          status: 'Poll Failed',
        },
        {
          id: 'blubb-blubb-blubb-ship1002',
          assetName: 'Ship1002',
          assetId: 'c6bccbb8-e737-4195-8603-2688273a75e8',
          assetIrcs: 'F1002',
          lastKnownLocation: {
            location: {
              longitude: 10.640111666666667,
              latitude: 58.00071666666667,
              altitude: null
            },
            heading: 105,
            guid: '70aa09c3-a68f-4c7e-a828-ef658fbe7b42',
            timestamp: '2019-11-20T06:51:32Z',
            speed: 10.2205781,
            source: 'INMARSAT_C'
          },
          status: 'Poll Failed',
        },
      ]);
      observer.complete();
    });
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

  createAsset(authToken: string, asset: AssetInterfaces.Asset) {
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

  updateAsset(authToken: string, asset: AssetInterfaces.Asset) {
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


  // return this.http.get(
  //   environment.baseApiUrl + 'asset/rest/group/list?user=vms_admin_se', {
  //     headers: new HttpHeaders({
  //       Authorization: authToken,
  //       'Cache-Control': 'no-cache'
  //     })
  //   }
  // );

  // return this.http.get(
  //   environment.baseApiUrl + 'spatialSwe/rest/area/allNonUserAreas', {
  //     headers: new HttpHeaders({
  //       Authorization: authToken,
  //       'Cache-Control': 'no-cache'
  //     })
  //   }
  // );

  // return this.http.get(
  //   environment.baseApiUrl + 'spatialSwe/rest/area/getAreaLayer/EEZ', {
  //     headers: new HttpHeaders({
  //       Authorization: authToken,
  //       'Cache-Control': 'no-cache'
  //     })
  //   }
  // );

  // return this.http.get(
  //   environment.baseApiUrl + 'spatialSwe/rest/area/layers', {
  //     headers: new HttpHeaders({
  //       Authorization: authToken,
  //       'Cache-Control': 'no-cache'
  //     })
  //   }
  // );

}
