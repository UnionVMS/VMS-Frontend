import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control.js';
import { format } from 'ol/coordinate.js';
import Select from 'ol/interaction/Select.js';
import { click, pointerMove } from 'ol/events/condition.js';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { AuthSelectors } from '@data/auth';
import { MapLayersActions, MapLayersSelectors, MapLayersInterfaces } from '@data/map-layers';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsInterfaces } from '@data/map-settings';
import { MapSavedFiltersActions, MapSavedFiltersSelectors, MapSavedFiltersInterfaces } from '@data/map-saved-filters';

import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  public mapSettings: MapSettingsInterfaces.State;
  public mapSettingsSubscription: Subscription;
  public positionsForInspection$: Observable<{ [id: number]: AssetInterfaces.Movement }>;
  public selectedAssets$: Observable<Array<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  }>>;
  public currentFilterQuery$: Observable<Array<AssetInterfaces.AssetFilterQuery>>;
  public savedFilters$: Observable<{ [filterName: string]: Array<AssetInterfaces.AssetFilterQuery> }>;
  public activeFilterNames$: Observable<Array<string>>;
  public assetGroups$: Observable<Array<AssetInterfaces.AssetGroup>>;
  public selectedAssetGroups$: Observable<Array<AssetInterfaces.AssetGroup>>;
  public authToken$: Observable<string|null>;
  public mapLayers$: Observable<Array<MapLayersInterfaces.MapLayer>>;
  public activeMapLayers$: Observable<Array<string>>;

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
  public searchAutocomplete: Function;
  // tslint:enable:ban-types
  public addActiveLayer: (layerName: string) => void;
  public addSavedFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  public activateSavedFilter: (filterName: string) => void;
  public clearAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;
  public deactivateSavedFilter: (filterName: string) => void;
  public filterAssets: (filterQuery: Array<AssetInterfaces.AssetFilterQuery>) => void;
  public removeActiveLayer: (layerName: string) => void;
  public removePositionForInspection: (inspectionId: string) => void;
  public setAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  // public registerOnHoverFunction: (name: string, hoverFunction: (event) => void) => void;
  public setCurrentControlPanel: (controlPanelName: string|null) => void;

  private assetMovements: Array<AssetInterfaces.AssetMovementWithEssentials>;
  private assetSubscription: Subscription;
  public mapZoom = 10;
  // tslint:disable-next-line:ban-types
  private onClickFunctions: { [name: string]: Function } = {};
  private onSelectFunctions: { [name: string]: (event) => void } = {};
  private onHoverFunctions: { [name: string]: (event) => void } = {};

  private assetTracks$: Observable<any>;
  private forecasts$: Observable<any>;
  public searchAutocompleteAsset$: Observable<any>;
  private selection: Select;
  private hoverSelection: Select;

  private getAssetTrack: (assetId: string, movementGuid: string) => void;
  private getAssetTrackTimeInterval: (assetId: string, startDate: string, endDate: string) => void;
  private removeForecast: (assetId: string) => void;
  public selectAsset: (assetId: string) => void;
  private untrackAsset: (assetId: string) => void;
  private unregisterOnClickFunction: (name: string) => void;
  private unregisterOnSelectFunction: (name: string) => void;
  // private unregisterOnHoverFunction: (name: string) => void;

  // Map functions to props:
  public centerMapOnPosition: (position: Position) => void;

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
    this.assetGroups$ = this.store.select(AssetSelectors.getAssetGroups);
    this.selectedAssetGroups$ = this.store.select(AssetSelectors.getSelectedAssetGroups);
    this.authToken$ = this.store.select(AuthSelectors.getAuthToken);
    this.mapLayers$ = this.store.select(MapLayersSelectors.getMapLayers);
    this.activeMapLayers$ = this.store.select(MapLayersSelectors.getActiveLayers);
  }

  mapDispatchToProps() {
    this.addActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.addActiveLayer({ layerName }));
    this.addSavedFilter = (filter: MapSavedFiltersInterfaces.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.addSavedFilter({ filter }));
    this.activateSavedFilter = (filterName: string) =>
      this.store.dispatch(MapSavedFiltersActions.activateFilter({ filterName }));
    this.clearAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(AssetActions.clearAssetGroup({assetGroup}));
    this.deactivateSavedFilter = (filterName: string) =>
      this.store.dispatch(MapSavedFiltersActions.deactivateFilter({ filterName }));
    this.deselectAsset = (assetId) =>
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    this.setAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(AssetActions.setAssetGroup({ assetGroup }));
    this.saveViewport = (key: number, viewport: MapSettingsInterfaces.Viewport) =>
      this.store.dispatch(MapSettingsActions.saveViewport({key, viewport}));
    this.setVisibilityForAssetNames = (visible: boolean) =>
      this.store.dispatch(MapSettingsActions.setVisibilityForAssetNames({ visibility: visible }));
    this.setVisibilityForAssetSpeeds = (visible: boolean) =>
      this.store.dispatch(MapSettingsActions.setVisibilityForAssetSpeeds({ visibility: visible }));
    this.setVisibilityForTracks = (visible: boolean) =>
      this.store.dispatch(MapSettingsActions.setVisibilityForTracks({ visibility: visible }));
    this.setVisibilityForFlags = (visible: boolean) =>
      this.store.dispatch(MapSettingsActions.setVisibilityForFlags({ visibility: visible }));
    this.setVisibilityForForecast = (forecasts: boolean) =>
      this.store.dispatch(MapSettingsActions.setVisibilityForForecast({ visibility: forecasts }));
    this.setTracksMinuteCap = (minutes: number) =>
      this.store.dispatch(MapSettingsActions.setTracksMinuteCap({ minutes }));
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.getAssetTrack = (assetId: string, movementGuid: string) =>
      this.store.dispatch(AssetActions.getAssetTrack({ assetId, movementGuid }));
    this.getAssetTrackTimeInterval = (assetId, startDate, endDate) =>
      this.store.dispatch(AssetActions.getAssetTrackTimeInterval({ assetId, startDate, endDate }));
    this.untrackAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.untrackAsset({ assetId }));
    this.addPositionForInspection = (track) =>
      this.store.dispatch(AssetActions.addPositionForInspection({ positionForInspection: track }));
    this.removeActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.removeActiveLayer({ layerName }));
    this.removePositionForInspection = (inspectionId) =>
      this.store.dispatch(AssetActions.removePositionForInspection({ inspectionId }));
    this.addForecast = (assetId: string) =>
      this.store.dispatch(AssetActions.addForecast({ assetId }));
    this.removeForecast = (assetId: string) =>
      this.store.dispatch(AssetActions.removeForecast({ assetId }));
    this.clearForecasts = () =>
      this.store.dispatch(AssetActions.clearForecasts());
    this.clearTracks = () =>
      this.store.dispatch(AssetActions.clearTracks());
    this.setForecastInterval = (forecastTimeLength: number) =>
      this.store.dispatch(MapSettingsActions.setForecastInterval({ interval: forecastTimeLength }));
    this.setCurrentControlPanel = (controlPanelName) =>
      this.store.dispatch(MapSettingsActions.setCurrentControlPanel({ controlPanelName }));
    this.searchAutocomplete = (searchQuery: string) =>
      this.store.dispatch(AssetActions.setAutocompleteQuery({searchQuery}));
    this.filterAssets = (filterQuery) => {
      return this.store.dispatch(AssetActions.setFilterQuery({filterQuery}));
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
    this.store.dispatch(AssetActions.subscribeToMovements());
    this.store.dispatch(AssetActions.getAssetGroups());
    this.store.dispatch(MapLayersActions.getAreas());
    this.mapZoom = this.mapSettings.startZoomLevel;
    const scaleLineControl = new ScaleLine();
    const mousePositionControl = new MousePosition({
      coordinateFormat: (coordinates) => format(coordinates, 'Lat: {y}, Lon: {x}', 4),
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
    this.store.dispatch(AssetActions.unsubscribeToMovements());
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

    this.selection = new Select({hitTolerance: 7, condition: click });
    this.map.addInteraction(this.selection);

    this.selection.on('select', (event) => {
      Object.values(this.onSelectFunctions).map((selectFunction) => selectFunction(event));
    });

    // this.registerOnHoverFunction = (name, onHoverFunction) => {
    //   this.onHoverFunctions[name] = onHoverFunction;
    // };
    //
    // this.unregisterOnHoverFunction = (name) => {
    //   delete this.onHoverFunctions[name];
    // };

    // this.hoverSelection = new Select({hitTolerance: 3, condition: pointerMove });
    // this.map.addInteraction(this.hoverSelection);
    //
    // this.hoverSelection.on('select', (event) => {
    //   Object.values(this.onHoverFunctions).map((hoverFunction) => hoverFunction(event));
    // });
    //
    // this.map.on('pointermove', (event) => {
    //   Object.values(this.onHoverFunctions).map(hoverFunction => hoverFunction(event));
    // });
  }
}
