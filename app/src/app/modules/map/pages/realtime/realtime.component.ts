import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, skipWhile } from 'rxjs/operators';

import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import Overlay from 'ol/Overlay';

import { registerProjectionDefinitions } from '@app/helpers/projection-definitions';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { AuthSelectors } from '@data/auth';
import { IncidentActions } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { MapLayersActions, MapLayersSelectors, MapLayersTypes } from '@data/map-layers';
import { MapSettingsActions, MapSettingsSelectors, MapSettingsTypes } from '@data/map-settings';
import { MapSavedFiltersActions } from '@data/map-saved-filters';
import { NotificationsActions } from '@data/notifications';
import { RouterSelectors } from '@data/router';
import { UserSettingsSelectors } from '@data/user-settings';

import { Position } from '@data/generic.types';

@Component({
  selector: 'map-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit, OnDestroy {

  public mapSettings: MapSettingsTypes.State;
  public selectedAssets: ReadonlyArray<{
    asset: AssetTypes.Asset,
    assetTracks: AssetTypes.AssetTrack,
    currentPosition: AssetTypes.AssetMovement
  }>;
  public authToken$: Observable<string|null>;
  public mapLayers$: Observable<Array<MapLayersTypes.MapLayer>>;
  public cascadedLayers$: Observable<Array<MapLayersTypes.CascadedLayer>>;
  public activeMapLayers$: Observable<Array<string>>;
  public clearMeasurements$: Subject<boolean>;

  public assetIdFromUrl: string;

  public mapReady = false;
  public mapSettingsLoaded = false;
  public map: Map;

  public deselectAsset: (assetId: string) => void;
  public getIncidentsForAssetId: (assetId: string) => void;
  public setChoosenMovementSources: (movementSources: ReadonlyArray<string>) => void;
  public clearMessurements: () => void;

  public registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  public registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  public saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) => void;

  public assetMovements: Array<AssetTypes.AssetMovementWithEssentials>;
  public mapZoom = 10;
  // tslint:disable-next-line:ban-types
  private readonly onClickFunctions: { [name: string]: Function } = {};
  private readonly onSelectFunctions: { [name: string]: (event) => void } = {};

  public assetTracks$: Observable<any>;
  public forecasts$: Observable<any>;
  public movementSources$: Observable<ReadonlyArray<string>>;
  public choosenMovementSources$: Observable<ReadonlyArray<string>>;
  private selection: Select;

  public selectAsset: (assetId: string) => void;
  public unregisterOnClickFunction: (name: string) => void;
  public unregisterOnSelectFunction: (name: string) => void;
  public userTimezone$: Observable<string>;
  public experimentalFeaturesEnabled$: Observable<boolean>;

  public activePanel = '';
  public activeRightPanel: ReadonlyArray<string>;
  public activeLeftPanel: ReadonlyArray<string>;
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
    this.store.select(MapSelectors.getActiveRightPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activeRightPanel = activePanel;
    });
    this.store.select(MapSelectors.getActiveLeftPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activeLeftPanel = activePanel;
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
    this.store.select(AssetSelectors.extendedDataForSelectedAssets).pipe(takeUntil(this.unmount$)).subscribe((selectedAssets) => {
      this.selectedAssets = selectedAssets;
    });
    this.assetTracks$ = this.store.select(AssetSelectors.getAssetTracks);
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
    this.store.select(MapSettingsSelectors.getMapSettingsState).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.authToken$ = this.store.select(AuthSelectors.getAuthToken);
    this.mapLayers$ = this.store.select(MapLayersSelectors.getMapLayers);
    this.cascadedLayers$ = this.store.select(MapLayersSelectors.getCascadedLayers);
    this.activeMapLayers$ = this.store.select(MapLayersSelectors.getActiveLayers);
    this.movementSources$ = this.store.select(MapSettingsSelectors.getMovementSources);
    this.choosenMovementSources$ = this.store.select(MapSettingsSelectors.getChoosenMovementSources);
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
            this.centerMapOnPosition(assetMovement.assetMovement.movement.location);
          } else {
            this.store.dispatch(NotificationsActions.addNotice(
              // tslint:disable-next-line max-line-length
              $localize`:@@ts-map-realtime-selected-asset-dont-exist-error:Asset has not sent a position for the last 8 hours and is not shown on map.`
            ));
          }
        }
    });
    this.store.select(AuthSelectors.getUser).pipe(
      takeUntil(this.unmount$),
      skipWhile(user => user === null || typeof user.role === 'undefined' || typeof user.scope === 'undefined'),
      take(1)
    ).subscribe((user) => {
      this.store.dispatch(MapLayersActions.getUserAreas());
    });
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
    this.experimentalFeaturesEnabled$ = this.store.select(UserSettingsSelectors.getExperimentalFeaturesEnabled);
  }

  mapDispatchToProps() {
    this.deselectAsset = (assetId) => {
      if(this.selectedAssets.length === 1) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['information'] }));
      } else if(this.selectedAssets.length === 2) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
      }
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    };
    this.getIncidentsForAssetId = (assetId) =>
      this.store.dispatch(IncidentActions.getIncidentsForAssetId({ assetId }));
    this.selectAsset = (assetId: string) => {
      if(this.activeLeftPanel[0] === 'workflows') {
        this.getIncidentsForAssetId(assetId);
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
      } else {
        if(this.selectedAssets.length === 0) {
          this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
        } else {
          this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['listAssets'] }));
        }
      }
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
      this.store.dispatch(AssetActions.getLastPositionsForSelectedAsset({ assetId }));
    };
    this.setChoosenMovementSources = (movementSources) =>
      this.store.dispatch(MapSettingsActions.setChoosenMovementSources({ movementSources }));
    this.saveMapLocation = (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) =>
      this.store.dispatch(MapSettingsActions.saveMapLocation({ key, mapLocation, save }));
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
    this.clearMeasurements$ = new Subject<boolean>();
    this.clearMessurements = () => this.clearMeasurements$.next(true);
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.subscribeToMovements());
    this.store.dispatch(AssetActions.getSelectedAsset());
    this.store.dispatch(IncidentActions.getIncidentTypes());
    this.store.dispatch(IncidentActions.getValidIncidentStatusForTypes());
    this.store.dispatch(IncidentActions.getAllOpenIncidents());
    this.store.dispatch(MapLayersActions.getAreas());
    this.store.dispatch(MapLayersActions.getCascadedLayers());
    this.store.dispatch(MapLayersActions.addActiveLayer({ layerName: 'openstreetmap' }));
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe((mergedRoute) => {
      if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.assetId !== 'undefined') {
        this.assetIdFromUrl = mergedRoute.params.assetId;
      }
    });
    this.store.dispatch(MapSettingsActions.getMovementSources());
    this.store.dispatch(MapSavedFiltersActions.getAll());
    this.store.dispatch(AssetActions.getNumberOfVMSAssetsInSystem());
  }

  setupMap() {
    registerProjectionDefinitions();

    this.mapZoom = this.mapSettings.settings.startZoomLevel;
    const scaleLineControl = new ScaleLine({
      units: this.mapSettings.settings.unitOfDistance
    });
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
      target: 'realtime-map',
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
    const mapMountedObserver = new MutationObserver((mutations, mutationObserver) => {
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
    mapMountedObserver.observe(document.getElementById('realtime-map'), {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if(this.unmount$) {
      this.unmount$.next(true);
      this.unmount$.unsubscribe();
    }
    if(this.clearMeasurements$) {
      this.clearMeasurements$.unsubscribe();
    }
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
  }
}
