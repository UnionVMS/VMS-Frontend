import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { bindCallback, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private movementEventSource: EventSourcePolyfill;
  private movementObserver$;

  constructor(private http: HttpClient) {}

  // track/microMovement/byMovementGUID

  subscribeToMovements(authToken: string) {
    this.movementEventSource = new EventSourcePolyfill(environment.baseApiUrl + 'movement/rest/sseV2/subscribe', {
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
    return Observable.create((observer) => {
      that.movementObserver$ = observer;

      that.movementEventSource.addEventListener('Movement', (asset) => observer.next(JSON.parse(asset.data)));
    });
  }

  unsubscribeToMovements() {
    this.movementObserver$.complete();
    console.log(
      '-------- We get error here due to the fact that we are closing the connection in ' +
      'the middle of getting new messages.\n' +
      '-------- There seamse to be no way around this and it does not seam to do any harm.'
    );
    this.movementEventSource.close();
  }

  getAsset(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/asset/history/' + assetId, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getAssetTrack(authToken: string, movementGuid: string) {
    return this.http.get(
      environment.baseApiUrl + 'movement/rest/track/microMovement/byMovementGUID/' + movementGuid, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getAssetInformation(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + 'asset/rest/asset/' + assetId
    );
  }
}
