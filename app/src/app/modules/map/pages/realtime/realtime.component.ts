import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { XYZ, TileWMS } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control.js';
import { format } from 'ol/coordinate.js';
import Select from 'ol/interaction/Select.js';
import { click, pointerMove } from 'ol/events/condition.js';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { AuthSelectors } from '@data/auth';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsInterfaces } from '@data/map-settings';
import { MapSavedFiltersActions, MapSavedFiltersSelectors, MapSavedFiltersInterfaces } from '@data/map-saved-filters';
import { MapLayersActions } from '@data/map-layers';

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
  public filterAssets: Function;
  // tslint:enable:ban-types
  public addSavedFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  public activateSavedFilter: (filterName: string) => void;
  public clearAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;
  public deactivateSavedFilter: (filterName: string) => void;
  public removePositionForInspection: (inspectionId: string) => void;
  public setAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  public registerOnHoverFunction: (name: string, hoverFunction: (event) => void) => void;
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

  private getAssetTrack: (assetId, movementGuid) => void;
  private getAssetTrackFromTime: (assetId, datetime) => void;
  private removeForecast: (assetId) => void;
  public selectAsset: (assetId) => void;
  private untrackAsset: (assetId) => void;
  private unregisterOnClickFunction: (name: string) => void;
  private unregisterOnSelectFunction: (name: string) => void;
  private unregisterOnHoverFunction: (name: string) => void;

  // Map functions to props:
  public centerMapOnPosition: (position) => void;

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
  }

  mapDispatchToProps() {
    this.addSavedFilter = (filter: MapSavedFiltersInterfaces.SavedFilter) =>
      this.store.dispatch(new MapSavedFiltersActions.AddSavedFilter(filter));
    this.activateSavedFilter = (filterName: string) =>
      this.store.dispatch(new MapSavedFiltersActions.ActivateFilter(filterName));
    this.clearAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(new AssetActions.ClearAssetGroup(assetGroup));
    this.deactivateSavedFilter = (filterName: string) =>
      this.store.dispatch(new MapSavedFiltersActions.DeactivateFilter(filterName));
    this.deselectAsset = (assetId) =>
      this.store.dispatch(new AssetActions.DeselectAsset(assetId));
    this.setAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(new AssetActions.SetAssetGroup(assetGroup));
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
    this.store.dispatch(new AssetActions.GetAssetGroups());
    this.store.dispatch(new MapLayersActions.GetAreas());
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

    this.selection = new Select({hitTolerance: 7, condition: click });
    this.map.addInteraction(this.selection);

    this.selection.on('select', (event) => {
      Object.values(this.onSelectFunctions).map((selectFunction) => selectFunction(event));
    });

    this.registerOnHoverFunction = (name, onHoverFunction) => {
      this.onHoverFunctions[name] = onHoverFunction;
    };

    this.unregisterOnHoverFunction = (name) => {
      delete this.onHoverFunctions[name];
    };

    this.hoverSelection = new Select({hitTolerance: 3, condition: pointerMove });
    this.map.addInteraction(this.hoverSelection);

    this.hoverSelection.on('select', (event) => {
      Object.values(this.onHoverFunctions).map((hoverFunction) => hoverFunction(event));
    });

    // this.map.on('pointermove', (event) => {
    //   Object.values(this.onHoverFunctions).map(hoverFunction => hoverFunction(event));
    // });
  }
}
