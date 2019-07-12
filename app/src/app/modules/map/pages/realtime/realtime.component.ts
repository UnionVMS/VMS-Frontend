import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import Select from 'ol/interaction/Select.js';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control.js';
import { format } from 'ol/coordinate.js';

import { EventSourcePolyfill } from 'event-source-polyfill';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsInterfaces } from '@data/map-settings';
import { MapSavedFiltersActions, MapSavedFiltersSelectors, MapSavedFiltersInterfaces } from '@data/map-saved-filters';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  public mapSettings: MapSettingsInterfaces.State;
  public mapSettingsSubscription: Subscription;
  public positionsForInspection$: Observable<any>;
  public selectedAssets$: Observable<Array<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  }>>;
  public currentFilterQuery$: Observable<Array<AssetInterfaces.AssetFilterQuery>>;
  public savedFilters$: Observable<{ [filterName: string]: Array<AssetInterfaces.AssetFilterQuery> }>;
  public activeFilterNames$: Observable<Array<string>>;

  public map: Map;

  // tslint:disable:ban-types
  public addForecast: Function;
  public addPositionForInspection: Function;
  public clearForecasts: Function;
  public clearTracks: Function;
  public deselectAsset: (assetId: string) => void;
  public saveViewport: Function;
  public setForecastInterval: Function;
  public setVisibilityForAssetNames: Function;
  public setVisibilityForAssetSpeeds: Function;
  public setVisibilityForForecast: Function;
  public setVisibilityForTracks: Function;
  public setVisibilityForFlags: Function;
  public setTracksMinuteCap: Function;
  public removePositionForInspection: Function;
  public searchAutocomplete: Function;
  public filterAssets: Function;
  // tslint:enable:ban-types
  public addSavedFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  public activateSavedFilter: (filterName: string) => void;
  public deactivateSavedFilter: (filterName: string) => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  public setCurrentControlPanel: (controlPanelName: string|null) => void;

  private assetMovements: Array<AssetInterfaces.AssetMovementWithEssentials>;
  private assetSubscription: Subscription;
  public mapZoom = 10;
  // tslint:disable-next-line:ban-types
  private onClickFunctions: { [name: string]: Function } = {};
  private onSelectFunctions: { [name: string]: (event) => void } = {};

  private assetTracks$: Observable<any>;
  private forecasts$: Observable<any>;
  public searchAutocompleteAsset$: Observable<any>;
  private selection: Select;

  // tslint:disable:ban-types
  private getAssetTrack: Function;
  private getAssetTrackFromTime: Function;
  private removeForecast: Function;
  public selectAsset: Function;
  private untrackAsset: Function;
  // tslint:enable:ban-types
  private unregisterOnClickFunction: (name: string) => void;
  private unregisterOnSelectFunction: (name: string) => void;

  // Map functions to props:
  // tslint:disable:ban-types
  public centerMapOnPosition: Function;
  // tslint:enable:ban-types

  constructor(private store: Store<any>) { }

  mapStateToProps() {
    this.assetSubscription = this.store.select(AssetSelectors.getAssetMovements).subscribe((assets) => {
      this.assetMovements = assets;
    });
    this.selectedAssets$ = this.store.select(AssetSelectors.extendedDataForSelectedAssets);
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
    this.positionsForInspection$ = this.store.select(AssetSelectors.getPositionsForInspection);
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
    this.searchAutocompleteAsset$ = this.store.select(AssetSelectors.getSearchAutocomplete);
    this.mapSettingsSubscription = this.store.select(MapSettingsSelectors.getMapSettingsState).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.currentFilterQuery$ = this.store.select(AssetSelectors.selectFilterQuery);
    this.savedFilters$ = this.store.select(MapSavedFiltersSelectors.getSavedFilters);
    this.activeFilterNames$ = this.store.select(MapSavedFiltersSelectors.selectActiveFilters);
  }

  mapDispatchToProps() {
    this.addSavedFilter = (filter: MapSavedFiltersInterfaces.SavedFilter) =>
      this.store.dispatch(new MapSavedFiltersActions.AddSavedFilter(filter));
    this.activateSavedFilter = (filterName: string) =>
      this.store.dispatch(new MapSavedFiltersActions.ActivateFilter(filterName));
    this.deactivateSavedFilter = (filterName: string) =>
      this.store.dispatch(new MapSavedFiltersActions.DeactivateFilter(filterName));
    this.deselectAsset = (assetId) =>
      this.store.dispatch(new AssetActions.DeselectAsset(assetId));
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
    this.setCurrentControlPanel = (controlPanelName) =>
      this.store.dispatch(new MapSettingsActions.SetCurrentControlPanel(controlPanelName));
    this.searchAutocomplete = (searchQuery) =>
      this.store.dispatch(new AssetActions.SetAutocompleteQuery({searchQuery}));
    this.filterAssets = (filterQuery) => {
      return this.store.dispatch(new AssetActions.SetFilterQuery({filterQuery}));
    };
  }

  mapFunctionsToProps() {
    this.centerMapOnPosition = (position) => {
      if(this.mapZoom < 10) {
        this.mapZoom = 10;
      }
      this.map.getView().animate({zoom: this.mapZoom, center: fromLonLat([position.longitude, position.latitude])});
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(new AssetActions.SubscribeToMovements());
    this.mapZoom = this.mapSettings.startZoomLevel;
    const scaleLineControl = new ScaleLine();
    const mousePositionControl = new MousePosition({
      coordinateFormat: (coordinates) => format(coordinates, 'Lat: {y}, Long: {x}', 4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });
    this.map = new Map({
      controls: defaultControls().extend([scaleLineControl, mousePositionControl]),
      target: 'realtime-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: fromLonLat([this.mapSettings.startPosition.longitude, this.mapSettings.startPosition.latitude]),
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

    this.mapFunctionsToProps();
  }

  ngOnDestroy() {
    if(this.assetSubscription !== undefined) {
      this.assetSubscription.unsubscribe();
    }
    if(this.mapSettingsSubscription !== undefined) {
      this.mapSettingsSubscription.unsubscribe();
    }
    this.store.dispatch(new AssetActions.UnsubscribeToMovements());
  }

  setupOnClickEvents() {
    this.registerOnClickFunction = (name, onClickFunction) => {
      this.onClickFunctions[name] = onClickFunction;
    };

    this.unregisterOnClickFunction = (name) => {
      delete this.onClickFunctions[name];
    };

    this.map.on('click', (event) => {
      Object.values(this.onClickFunctions).map((clickFunction) => clickFunction(event));
    });

    this.registerOnSelectFunction = (name, onClickFunction) => {
      this.onSelectFunctions[name] = onClickFunction;
    };

    this.unregisterOnSelectFunction = (name) => {
      delete this.onSelectFunctions[name];
    };

    this.selection = new Select({hitTolerance: 7});
    this.map.addInteraction(this.selection);
    this.selection.on('select', (event) => {
      Object.values(this.onSelectFunctions).map((selectFunction) => selectFunction(event));
    });
  }
}
