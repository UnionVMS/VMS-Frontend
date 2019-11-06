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
  private movementEventSource: EventSourcePolyfill;
  private movementObserver$;
  private assetEventSource: EventSourcePolyfill;
  private assetObserver$;

  constructor(private http: HttpClient) {}

  getInitalAssetMovements(authToken: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/micro/latest', {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  subscribeToMovements(authToken: string) {
    this.movementEventSource = new EventSourcePolyfill(environment.baseApiUrl + 'movement/rest/sse/subscribe', {
      headers: {
        Authorization: authToken,
        'Cache-Control': 'no-cache'
      }
    });
    const listener = (event) => {
      if (event.type === 'error') {
        console.error('Movement event stream: [Error]', event);
      } else {
        console.warn('Movement event stream: [' + event.type + '] ', (event.type === 'message' ? event.data : event));
      }
    };
    this.movementEventSource.addEventListener('open', listener);
    this.movementEventSource.addEventListener('message', listener);
    this.movementEventSource.addEventListener('error', listener);
    const that = this;
    return new Observable((observer) => {
      that.movementObserver$ = observer;

      that.movementEventSource.addEventListener('Movement', (asset) => observer.next(JSON.parse(asset.data)));
    });
  }

  subscribeToAssetUpdates(authToken: string) {
    this.assetEventSource = new EventSourcePolyfill(environment.baseApiUrl + 'asset/rest/sse/subscribe', {
      headers: {
        Authorization: authToken,
        'Cache-Control': 'no-cache'
      }
    });
    const listener = (event) => {
      if (event.type === 'error') {
        console.error('Asset event stream: [Error]', event);
      } else {
        console.warn('Asset event stream: [' + event.type + '] ', (event.type === 'message' ? event.data : event));
      }
    };
    this.assetEventSource.addEventListener('open', listener);
    this.assetEventSource.addEventListener('message', listener);
    this.assetEventSource.addEventListener('error', listener);
    const that = this;
    return new Observable((observer) => {
      that.assetObserver$ = observer;
      // TODO: This has been split into 2 types of messages, split them and fix corresponding logic in effects.
      that.assetEventSource.addEventListener('Asset', (asset) => observer.next(JSON.parse(asset.data)));
    });
  }

  unsubscribeToMovements() {
    this.movementObserver$.complete();
    this.assetObserver$.complete();
    console.log(
      '-------- We get error here due to the fact that we are closing the connection in ' +
      'the middle of getting new messages.\n' +
      '-------- There seamse to be no way around this and it does not seam to do any harm.'
    );
    this.movementEventSource.close();
    this.assetEventSource.close();
  }

  getAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/asset2/' + assetId, {
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
    return this.http.get(
      environment.baseApiUrl + `movement/rest/micro/track/asset/${assetId}?startDate=${startDate}&endDate=${endDate}`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  listAssets(authToken: string, requestParams) {
    // console.warn(`RequestParams we should send when it's implemented: `, requestParams);
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/list/`,
      requestParams,
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
