import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { IconsModule } from 'angular-bootstrap-md';
import Select from 'ol/interaction/Select.js';

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
  private positionsForInspection$: Observable<any>;
  private forecasts$: Observable<any>;
  private selection: Select;

  private assets: Array<AssetReducer.Asset>;
  private assetSubscription: Subscription;
  private map: Map;
  private mapZoom = 6;
  private onClickFunctions: { [name: string]: Function } = {};

  private addForecast: Function;
  private addPositionForInspection: Function;
  private clearForecasts: Function;
  private clearTracks: Function;
  private removePositionForInspection: Function;
  private removeForecast: Function;
  private saveViewport: Function;
  private setVisibilityForAssetNames: Function;
  private setVisibilityForAssetSpeeds: Function;
  private setVisibilityForForecast: Function;
  private setTracksMinuteCap: Function;
  private setForecastInterval: Function;
  private selectAsset: Function;
  private getAssetTrack: Function;
  private getAssetTrackFromTime: Function;
  private untrackAsset: Function;
  private setVisibilityForTracks: Function;
  private setVisibilityForFlags: Function;
  private registerOnClickFunction: Function;
  private unregisterOnClickFunction: Function;

  constructor(private store: Store<AssetReducer.State>) { }

  mapStateToProps() {
    this.assetSubscription = this.store.select(AssetSelectors.getAssets).subscribe((assets) => {
      this.assets = assets;
    });
    this.mapSettings$ = this.store.select(MapSettingsSelectors.getMapSettingsState);
    this.selectedAsset$ = this.store.select(AssetSelectors.extendedDataForSelectedAsset);
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
    this.positionsForInspection$ = this.store.select(AssetSelectors.getPositionsForInspection);
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
  }

  mapDispatchToProps() {
    this.saveViewport = (key, viewport) =>
      this.store.dispatch(new MapSettingsActions.SaveViewport({key, viewport}));
    this.setVisibilityForAssetNames = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForAssetNames(visible));
    this.setVisibilityForAssetSpeeds = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForAssetSpeeds(visible));
    this.setVisibilityForTracks = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForTracks(visible));
    this.setVisibilityForFlags = (visible) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForFlags(visible));
    this.setVisibilityForForecast = (forecasts) =>
      this.store.dispatch(new MapSettingsActions.SetVisibilityForForecast(forecasts));
    this.setTracksMinuteCap = (minutes) =>
      this.store.dispatch(new MapSettingsActions.SetTracksMinuteCap(minutes));
    this.selectAsset = (assetId) =>
      this.store.dispatch(new AssetActions.SelectAsset(assetId));
    this.getAssetTrack = (assetId, movementGuid) =>
      this.store.dispatch(new AssetActions.GetAssetTrack({ assetId, movementGuid }));
    this.getAssetTrackFromTime = (assetId, datetime) =>
      this.store.dispatch(new AssetActions.GetAssetTrackFromTime({ assetId, datetime}));
    this.untrackAsset = (assetId) =>
      this.store.dispatch(new AssetActions.UntrackAsset(assetId));
    this.addPositionForInspection = (track) =>
      this.store.dispatch(new AssetActions.AddPositionForInspection(track));
    this.removePositionForInspection = (inspectionId) =>
      this.store.dispatch(new AssetActions.RemovePositionForInspection(inspectionId));
    this.addForecast = (assetId) =>
      this.store.dispatch(new AssetActions.AddForecast(assetId));
    this.removeForecast = (assetId) =>
      this.store.dispatch(new AssetActions.RemoveForecast(assetId));
    this.clearForecasts = () =>
      this.store.dispatch(new AssetActions.ClearForecasts());
    this.clearTracks = () =>
      this.store.dispatch(new AssetActions.ClearTracks());
    this.setForecastInterval = (forecastTimeLength) =>
      this.store.dispatch(new MapSettingsActions.SetForecastInterval(forecastTimeLength));
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

    this.setupOnClickEvents();

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

  setupOnClickEvents() {
    this.registerOnClickFunction = (name, onClickFunction) => {
      this.onClickFunctions[name] = onClickFunction;
    };

    this.unregisterOnClickFunction = (name) => {
      delete this.onClickFunctions[name];
    }

    this.selection = new Select();
    this.map.addInteraction(this.selection);
    this.selection.on('select', (event) => {
      Object.keys(this.onClickFunctions).map((name) => this.onClickFunctions[name](event));
    });
  }
}