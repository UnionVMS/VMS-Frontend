import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { IconsModule } from 'angular-bootstrap-md'

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';

import { EventSourcePolyfill } from 'event-source-polyfill';

import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { MapSettingsActions, MapSettingsSelectors } from '../../../../data/map-settings';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  private mapSettings$: Observable<any>;
  private selectedAsset$: any;
  private assetTracks$: Observable<any>;

  private assets: Array<AssetReducer.Asset>;
  private assetSubscription: Subscription;
  private map: Map;
  private mapZoom = 6;

  private setVisibilityForAssetNames: Function;
  private setVisibilityForAssetSpeeds: Function;
  private selectAsset: Function;
  private getAssetTrack: Function;



  constructor(private store: Store<AssetReducer.State>) { }

  mapStateToProps() {
    this.assetSubscription = this.store.select(AssetSelectors.getAssets).subscribe((assets) => {
      this.assets = assets;
    });
    this.mapSettings$ = this.store.select(MapSettingsSelectors.getMapSettingsState);
    this.selectedAsset$ = this.store.select(AssetSelectors.extendedDataForSelectedAsset);
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
  }

  mapDispatchToProps() {
    this.setVisibilityForAssetNames = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForAssetNames(visible));
    this.setVisibilityForAssetSpeeds = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForAssetSpeeds(visible));
    this.selectAsset = (assetId) =>
      this.store.dispatch(new AssetActions.SelectAsset(assetId));
    this.getAssetTrack = (assetId, movementGuid) =>
      this.store.dispatch(new AssetActions.GetAssetTrack({ assetId, movementGuid }));
  }

  ngOnInit() {
    this.store.dispatch(new AssetActions.SubscribeToMovements());

    this.map = new Map({
      target: 'realtime-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: fromLonLat([14.1047925, 57.6806116]),
        zoom: this.mapZoom
      })
    });

    this.map.on('moveend', (event) => {
      const mapZoom = this.map.getView().getZoom();
      if(this.mapZoom !== mapZoom) {
        this.mapZoom = mapZoom;
      }
    });

    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.assetSubscription.unsubscribe();
    this.store.dispatch(new AssetActions.UnsubscribeToMovements());
  }

}
