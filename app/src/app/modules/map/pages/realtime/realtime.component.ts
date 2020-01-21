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

import { registerProjectionDefinitions } from '@app/helpers/projection-definitions';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { AuthSelectors } from '@data/auth';
import { IncidentActions } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { MapLayersActions, MapLayersSelectors, MapLayersInterfaces } from '@data/map-layers';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsInterfaces } from '@data/map-settings';
import { MapSavedFiltersActions, MapSavedFiltersSelectors, MapSavedFiltersInterfaces } from '@data/map-saved-filters';
import { NotificationsActions } from '@data/notifications';
import { RouterSelectors } from '@data/router';

import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  public mapSettings: MapSettingsInterfaces.State;
  public positionsForInspection$: Observable<{ [id: number]: AssetInterfaces.Movement }>;
  public selectedAssets$: Observable<Array<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  }>>;
  public authToken$: Observable<string|null>;
  public mapLayers$: Observable<Array<MapLayersInterfaces.MapLayer>>;
  public activeMapLayers$: Observable<Array<string>>;

  public assetIdFromUrl: string;

  public mapReady = false;
  public mapSettingsLoaded = false;
  public map: Map;

  // tslint:disable:ban-types
  public addForecast: Function;
  public addPositionForInspection: Function;
  public clearForecasts: () => void;
  public clearTracks: () => void;
  public deselectAsset: (assetId: string) => void;
  public setForecastInterval: (forecastTimeLength: number) => void;
  public setVisibilityForAssetNames: Function;
  public setVisibilityForAssetSpeeds: Function;
  public setVisibilityForForecast: Function;
  public setVisibilityForTracks: Function;
  public setVisibilityForFlags: Function;
  public setTracksMinuteCap: (minutes: number) => void;
    // tslint:enable:ban-types
  public addActiveLayer: (layerName: string) => void;
  public removeActiveLayer: (layerName: string) => void;
  public removePositionForInspection: (inspectionId: string) => void;
  public searchAutocomplete: (searchQuery: string) => void;
  public saveMapLocation: (key: number, mapLocation: MapSettingsInterfaces.MapLocation) => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  // public registerOnHoverFunction: (name: string, vectorLayer: VectorLayer, hoverFunction: (event) => void) => void;
  public setCurrentControlPanel: (controlPanelName: string|null) => void;

  private assetMovements: Array<AssetInterfaces.AssetMovementWithEssentials>;
  public mapZoom = 10;
  // tslint:disable-next-line:ban-types
  private onClickFunctions: { [name: string]: Function } = {};
  private onSelectFunctions: { [name: string]: (event) => void } = {};
  // private onHoverFunctions: { [name: string]: (event) => void } = {};

  private assetTracks$: Observable<any>;
  private forecasts$: Observable<any>;
  private selection: Select;
  // private hoverSelection: Select;

  private getAssetTrack: (assetId: string, movementGuid: string) => void;
  private getAssetTrackTimeInterval: (assetId: string, startDate: string, endDate: string) => void;
  private removeForecast: (assetId: string) => void;
  public selectAsset: (assetId: string) => void;
  private untrackAsset: (assetId: string) => void;
  private unregisterOnClickFunction: (name: string) => void;
  private unregisterOnSelectFunction: (name: string) => void;
  // private unregisterOnHoverFunction: (name: string) => void;

  public activePanel = '';
  private unmount$: Subject<boolean> = new Subject<boolean>();


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

  constructor(private store: Store<any>) { }

  mapStateToProps() {
    this.store.select(MapSelectors.getActiveLeftPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      if(typeof this.map !== 'undefined') {
        setTimeout(() => {
          // Fix potential map resize when scrollbar appear or dissappear
          this.map.updateSize();
        }, 200);
      }
    });
    this.store.select(AssetSelectors.getAssetMovements).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
      this.assetMovements = assets;
    });
    this.selectedAssets$ = this.store.select(AssetSelectors.extendedDataForSelectedAssets);
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
    this.positionsForInspection$ = this.store.select(AssetSelectors.getPositionsForInspection);
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
    this.store.select(MapSettingsSelectors.getMapSettingsState).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.authToken$ = this.store.select(AuthSelectors.getAuthToken);
    this.mapLayers$ = this.store.select(MapLayersSelectors.getMapLayers);
    this.activeMapLayers$ = this.store.select(MapLayersSelectors.getActiveLayers);
    this.store.select(MapSelectors.getRealtimeReadyAndSettingsLoaded)
      .pipe(takeUntil(this.unmount$)).subscribe(({ready, mapSettingsLoaded }) => {
        if(!this.mapSettingsLoaded && mapSettingsLoaded) {
          this.setupMap();
          this.mapSettingsLoaded = mapSettingsLoaded;
        }

        this.mapReady = ready;
        if(ready && mapSettingsLoaded && typeof this.assetIdFromUrl !== 'undefined') {
          const assetMovement = this.assetMovements.find((asset) => asset.assetMovement.asset === this.assetIdFromUrl);
          if(assetMovement !== undefined) {
            this.selectAsset(assetMovement.assetMovement.asset);
            this.centerMapOnPosition(assetMovement.assetMovement.microMove.location);
          } else {
            this.store.dispatch(NotificationsActions.addError(
              `Asset has not sent a position for the last 8 hours and is not shown on map.`
            ));
          }
        }
    });
  }

  mapDispatchToProps() {
    this.addActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.addActiveLayer({ layerName }));
    this.deselectAsset = (assetId) =>
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    this.saveMapLocation = (key: number, mapLocation: MapSettingsInterfaces.MapLocation) =>
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
  }

  mapFunctionsToProps() {
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
    this.store.dispatch(AssetActions.subscribeToMovements());
    this.store.dispatch(AssetActions.getSelectedAsset());
    this.store.dispatch(AssetActions.getAssetGroups());
    this.store.dispatch(IncidentActions.getAssetNotSendingIncidents());
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
    const scaleLineControl = new ScaleLine({
      units: this.mapSettings.settings.unitOfDistance
    });
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
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous'
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
      const canvasList = document.getElementById('realtime-map').getElementsByTagName('canvas');
      if (canvasList.length === 1) {
        this.map.updateSize();
        mutationObserver.disconnect(); // stop observing
        return;
      }
    });

    // start observing
    observer.observe(document.getElementById('realtime-map'), {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
    this.store.dispatch(AssetActions.unsubscribeToMovements());
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

    // this.hoverSelection = new Select({hitTolerance: 3, condition: pointerMove, style: false });
    // this.map.addInteraction(this.hoverSelection);
    //
    // this.hoverSelection.on('select', (event) => {
    //   Object.values(this.onHoverFunctions).map((hoverFunction) => hoverFunction(event));
    // });

    // this.map.on('pointermove', (event) => {
    //   Object.values(this.onHoverFunctions).map(hoverFunction => hoverFunction(event));
    // });
  }
}
