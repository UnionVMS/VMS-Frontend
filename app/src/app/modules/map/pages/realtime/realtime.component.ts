import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';

import { EventSourcePolyfill } from 'event-source-polyfill';

import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  assets: Array<AssetReducer.Asset>;
  private assetSubscription$: Subscription;
  map: Map;

  constructor(private store: Store<AssetReducer.State>) { }

  ngOnInit() {

    this.store.dispatch(new AssetActions.SubscribeToMovements());

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: fromLonLat([14.1047925, 57.6806116]),
        zoom: 6
      })
    });


    this.assetSubscription$ = this.store.select(AssetSelectors.getAssets).subscribe((assets) => {
      this.assets = assets;
    });

  }

  ngOnDestroy() {
    this.assetSubscription$.unsubscribe();
  }

}
