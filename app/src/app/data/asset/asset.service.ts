import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { bindCallback, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  SubscribeToMovements(authToken: string) {
    var es = new EventSourcePolyfill(environment.baseApiUrl + "movement/rest/sse/subscribe", {
      headers: {
        'Authorization': authToken,
        'Cache-Control': "no-cache"
      }
    });
    // var listener = function (event) {
    //   var div = document.createElement("div");
    //   var type = event.type;
    //   div.appendChild(document.createTextNode(type + ": " + (type === "message" ? event.data : es.url)));
    //   document.body.appendChild(div);
    // };
    // es.addEventListener("open", listener);
    // es.addEventListener("message", listener);
    // es.addEventListener("error", listener);

    return Observable.create(function(observer) {
      es.addEventListener('Movement', (asset) => observer.next(JSON.parse(asset.data)));
    });
  }
}
