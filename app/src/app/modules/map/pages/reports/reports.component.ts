import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, withLatestFrom } from 'rxjs/operators';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control.js';
import { format } from 'ol/coordinate.js';
import Select from 'ol/interaction/Select.js';
import { click, pointerMove } from 'ol/events/condition.js';
import Overlay from 'ol/Overlay';

import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { AuthSelectors } from '@data/auth';
import { MapActions, MapSelectors } from '@data/map';
import { MapLayersActions, MapLayersSelectors, MapLayersTypes } from '@data/map-layers';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsTypes } from '@data/map-settings';
import { MapSavedFiltersActions, MapSavedFiltersSelectors, MapSavedFiltersTypes } from '@data/map-saved-filters';
import { NotificationsActions } from '@data/notifications';
import { RouterSelectors } from '@data/router';

import { Position } from '@data/generic.types';

import { registerProjectionDefinitions } from '@app/helpers/projection-definitions';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';


@Component({
  selector: 'map-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {

  public showPeriodSelector = true;
  public assets: ReadonlyArray<AssetTypes.Asset>;
  public mapSettings: MapSettingsTypes.State;
  public positionsForInspection$: Observable<{ [id: number]: AssetTypes.Movement }>;
  public selectedAssets: Array<{
    asset: AssetTypes.Asset,
    assetTracks: AssetTypes.AssetTrack,
    currentPosition: AssetTypes.AssetMovement
  }>;
  public currentFilterQuery$: Observable<ReadonlyArray<AssetTypes.AssetFilterQuery>>;
  public savedFilters$: Observable<{ [id: string]: MapSavedFiltersTypes.SavedFilter }>;
  public activeFilterNames$: Observable<ReadonlyArray<string>>;
  public assetGroups$: Observable<ReadonlyArray<AssetTypes.AssetGroup>>;
  public selectedAssetGroups$: Observable<ReadonlyArray<AssetTypes.AssetGroup>>;
  public authToken$: Observable<string|null>;
  public mapLayers$: Observable<Array<MapLayersTypes.MapLayer>>;
  public activeMapLayers$: Observable<Array<string>>;
  public tripGranularity$: Observable<number>;
  public tripTimestamps$: Observable<ReadonlyArray<number>>;
  public tripTimestamp$: Observable<number>;

  public assetIdFromUrl: string;

  public mapReady = false;
  public mapSettingsLoaded = false;
  public map: Map;

  // tslint:disable:ban-types
  public addForecast: Function;
  public addPositionForInspection: Function;
  public deselectAsset: (assetId: string) => void;
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
  public filterAssets: (filterQuery: Array<AssetTypes.AssetFilterQuery>) => void;
  public getTracksByTimeInterval: (query: any, from: number, to: number, sources: string[]) => void;
  public removeActiveLayer: (layerName: string) => void;
  public removePositionForInspection: (inspectionId: string) => void;
  public saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation) => void;
  public setAssetGroup: (assetGroup: AssetTypes.AssetGroup) => void;
  public setAssetPositionsFromTripByTimestamp: (assetTripTimestamp: number) => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  // public registerOnHoverFunction: (name: string, vectorLayer: VectorLayer, hoverFunction: (event) => void) => void;
  public setCurrentControlPanel: (controlPanelName: string|null) => void;
  public setTimeInterval: (from: number, to: number) => void;

  public assetMovements: Array<AssetTypes.AssetMovementWithEssentials>;
  public mapZoom = 10;
  // tslint:disable-next-line:ban-types
  private readonly onClickFunctions: { [name: string]: Function } = {};
  private readonly  onSelectFunctions: { [name: string]: (event) => void } = {};
  // private onHoverFunctions: { [name: string]: (event) => void } = {};

  public assetTracks$: Observable<any>;
  public forecasts$: Observable<any>;
  public searchAutocompleteAsset$: Observable<any>;
  private selection: Select;
  // private hoverSelection: Select;

  private getAssetTrack: (assetId: string, movementId: string) => void;
  private removeForecast: (assetId: string) => void;
  public selectAsset: (assetId: string) => void;
  private untrackAsset: (assetId: string) => void;
  public unregisterOnClickFunction: (name: string) => void;
  public unregisterOnSelectFunction: (name: string) => void;
  // private unregisterOnHoverFunction: (name: string) => void;

  public activePanel = '';
  public rightColumnHidden = false;
  public leftColumnHidden = false;
  private readonly unmount$: Subject<boolean> = new Subject<boolean>();

  // Map functions to props:
  public centerMapOnPosition: (position: Position, zoom?: number) => void;
  public centerOnDefaultPosition: () => void;
  public toggleActivePanel: (panelName: string) => void;

  public overlays = {};

  public addOverlay = (id: string, content: HTMLElement, position: ReadonlyArray<number>) => {
    if(typeof this.overlays[id] !== 'undefined') {
      return false;
    }
    content.setAttribute('id', id);
    const overlay = new Overlay({
      element: content,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      position
    });
    this.overlays[id] = overlay;
    overlay.setPosition(position);

    this.map.addOverlay(overlay);
  }

  public removeOverlay = (id: string) => {
    if(typeof this.overlays[id] === 'undefined') {
      return false;
    }
    this.map.removeOverlay(this.overlays[id]);
    delete this.overlays[id];
  }

  public moveOverlay = (id: string, position: Array<number>) => {
    if(typeof this.overlays[id] === 'undefined') {
      return false;
    }
    this.overlays[id].setPosition(position);
  }

  public hideRightColumn = (hidden: boolean) => {
    this.rightColumnHidden = hidden;
  }

  public hideLeftColumn = (hidden: boolean) => {
    this.leftColumnHidden = hidden;
  }

  constructor(private readonly store: Store<any>) { }

  mapStateToProps() {
    this.store.select(AssetSelectors.getAssetMovements).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
      this.assetMovements = assets;
    });
    this.store.select(AssetSelectors.extendedDataForSelectedAssets).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
      this.selectedAssets = assets;
    });
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
    this.positionsForInspection$ = this.store.select(AssetSelectors.getPositionsForInspection);
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
    this.searchAutocompleteAsset$ = this.store.select(AssetSelectors.getSearchAutocomplete);
    this.store.select(MapSettingsSelectors.getMapSettingsState).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.currentFilterQuery$ = this.store.select(AssetSelectors.selectFilterQuery);
    this.activeFilterNames$ = this.store.select(MapSavedFiltersSelectors.selectActiveFilters);
    this.authToken$ = this.store.select(AuthSelectors.getAuthToken);
    this.mapLayers$ = this.store.select(MapLayersSelectors.getMapLayers);
    this.activeMapLayers$ = this.store.select(MapLayersSelectors.getActiveLayers);
    this.store.select(MapSelectors.selectMapSettingsLoaded).pipe(takeUntil(this.unmount$)).subscribe((mapSettingsLoaded) => {
      if(!this.mapSettingsLoaded && mapSettingsLoaded) {
        this.setupMap();
        this.mapSettingsLoaded = mapSettingsLoaded;
      }
    });

    this.tripGranularity$ = this.store.select(AssetSelectors.getTripGranularity);
    this.tripTimestamps$ = this.store.select(AssetSelectors.getTripTimestamps);
    this.tripTimestamp$ = this.store.select(AssetSelectors.getTripTimestamp);
  }

  mapDispatchToProps() {
    this.setAssetPositionsFromTripByTimestamp = (assetTripTimestamp: number) =>
      this.store.dispatch(AssetActions.setAssetPositionsFromTripByTimestamp({ assetTripTimestamp }));
    this.getTracksByTimeInterval = (query: any, from: number, to: number, sources: string[]) =>
      this.store.dispatch(AssetActions.getTracksByTimeInterval({ query, startDate: from, endDate: to, sources }));
    this.addActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.addActiveLayer({ layerName }));
    this.deselectAsset = (assetId) => {
      if(this.selectedAssets.length === 1) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['information'] }));
      } else if(this.selectedAssets.length === 2) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
      }
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    };
    this.setAssetGroup = (assetGroup: AssetTypes.AssetGroup) =>
      this.store.dispatch(AssetActions.setAssetGroup({ assetGroup }));
    this.saveMapLocation = (key: number, mapLocation: MapSettingsTypes.MapLocation) =>
      this.store.dispatch(MapSettingsActions.saveMapLocation({key, mapLocation}));
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
    this.selectAsset = (assetId: string) => {
      if(this.selectedAssets.length === 0) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
      } else {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['listAssets'] }));
      }
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    };
    this.getAssetTrack = (assetId: string, movementId: string) =>
      this.store.dispatch(AssetActions.getAssetTrack({ assetId, movementId }));
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
    this.setTimeInterval = (from: number, to: number) => {
      this.getTracksByTimeInterval(
        {
          fields: [
            { searchField: 'VESSEL_TYPE', searchValue: 'fishing' },
            { searchField: 'FLAG_STATE', searchValue: 'SWE' },
          ],
          logicalAnd: true
        },
        from,
        to,
        ['INMARSAT_C'] // ['NAF']
      );
      this.showPeriodSelector = false;
    };
    this.centerMapOnPosition = (position, zoom = null) => {
      if(zoom !== null) {
        this.mapZoom = zoom;
      } else if(this.mapZoom < 10) {
        this.mapZoom = 10;
      }

      this.map.getView().animate({zoom: this.mapZoom, center: fromLonLat([position.longitude, position.latitude])});
    };

    this.centerOnDefaultPosition = () => {
      this.centerMapOnPosition(
        this.mapSettings.settings.startPosition,
        this.mapSettings.settings.startZoomLevel
      );
    };

    this.toggleActivePanel = (panelName) => {
      if(this.activePanel === panelName) {
        this.activePanel = '';
      } else {
        this.activePanel = panelName;
      }
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.getSelectedAsset());
    this.store.dispatch(MapLayersActions.getAreas());
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe((mergedRoute) => {
      if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.assetId !== 'undefined') {
        this.assetIdFromUrl = mergedRoute.params.assetId;
      }
    });
  }

  setupMap() {
    registerProjectionDefinitions();

    this.mapZoom = this.mapSettings.settings.startZoomLevel;
    const scaleLineControl = new ScaleLine();
    const mousePositionControl = new MousePosition({
      coordinateFormat: (coordinates: ReadonlyArray<number>) => {
        const ddmCordinates = convertDDToDDM(coordinates[1], coordinates[0]);
        return ddmCordinates.latitude + ', ' + ddmCordinates.longitude;
      },
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });
    this.map = new Map({
      controls: defaultControls().extend([scaleLineControl, mousePositionControl]),
      target: 'reports-map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: fromLonLat([this.mapSettings.settings.startPosition.longitude, this.mapSettings.settings.startPosition.latitude]),
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

    // set up the mutation observer
    const observer = new MutationObserver((mutations, mutationObserver) => {
      // `mutations` is an array of mutations that occurred
      // `mutationObserver` is the MutationObserver instance
      const canvasList = document.getElementById('reports-map').getElementsByTagName('canvas');
      if (canvasList.length === 1) {
        this.map.updateSize();
        mutationObserver.disconnect(); // stop observing
        return;
      }
    });

    // start observing
    observer.observe(document.getElementById('reports-map'), {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
    this.store.dispatch(AssetActions.removeMovementsAndTracks());
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

    this.selection = new Select({hitTolerance: 7, condition: click, style: false });
    this.map.addInteraction(this.selection);

    this.selection.on('select', (event) => {
      Object.values(this.onSelectFunctions).map((selectFunction) => selectFunction(event));
      this.selection.getFeatures().clear();
    });
  }
}
