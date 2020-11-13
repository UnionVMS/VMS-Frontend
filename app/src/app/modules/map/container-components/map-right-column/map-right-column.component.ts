import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Map from 'ol/Map';
import getContryISO2 from 'country-iso-3-to-2';

import { Position } from '@data/generic.types';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentTypes, IncidentSelectors } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { NotesActions, NotesTypes } from '@data/notes';
import { MapSavedFiltersActions, MapSavedFiltersTypes, MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { MapSettingsActions, MapSettingsTypes, MapSettingsSelectors } from '@data/map-settings';
import { MapLayersActions, MapLayersTypes, MapLayersSelectors } from '@data/map-layers';
import { MobileTerminalTypes, MobileTerminalSelectors, MobileTerminalActions } from '@data/mobile-terminal';
import { UserSettingsSelectors } from '@data/user-settings';


@Component({
  selector: 'map-right-column',
  templateUrl: './map-right-column.component.html',
  styleUrls: ['./map-right-column.component.scss']
})
export class MapRightColumnComponent implements OnInit, OnDestroy {

  @Input() centerMapOnPosition: (position: Position) => void;
  @Input() map: Map;
  @Input() columnHidden: boolean;
  @Input() hideRightColumn: (hidden: boolean) => void;
  @Input() clearMessurements: () => void;
  @Input() mapZoom: number;

  public activePanel: ReadonlyArray<string>;
  public activeLeftPanel: ReadonlyArray<string>;
  public activeInformationPanel: string | null;
  public mapSettings: MapSettingsTypes.State;
  public forecasts$: Observable<any>;
  public selectedAsset: Readonly<AssetTypes.AssetData>;
  public selectedAssets: ReadonlyArray<AssetTypes.AssetData>;
  public selectedAssetsLastPositions: AssetTypes.LastPositionsList;
  public selectedIncident: Readonly<IncidentTypes.Incident>;
  public choosenMovementSources: ReadonlyArray<string>;
  public assetGroupFilters: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>;
  public incidentLogs: IncidentTypes.IncidentLogs;
  public incidentsForAssets: Readonly<{ readonly [assetId: string]: ReadonlyArray<IncidentTypes.Incident> }>;
  public incidentTypes$: Observable<IncidentTypes.IncidentTypesCollection>;
  public lastFullPositionsForSelectedAsset$: Observable<ReadonlyArray<AssetTypes.Movement>>;
  public lastPollsForSelectedAsset$: Observable<ReadonlyArray<AssetTypes.Poll>>;
  public licence$: Observable<AssetTypes.AssetLicence>;
  public licenceLoaded = false;
  public mapLayers$: Observable<Array<MapLayersTypes.MapLayer>>;
  public activeMapLayers$: Observable<Array<string>>;
  public userTimezone$: Observable<string>;
  public mapStatistics$: Observable<any>;

  public addActiveLayer: (layerName: string) => void;
  public removeActiveLayer: (layerName: string) => void;
  public addForecast: (assetId: string) => void;
  public createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  public createNote: (note: NotesTypes.NoteParameters) => void;
  public createIncidentNote: (incidentId: number, note: NotesTypes.NoteParameters) => void;
  public clearNotificationsForIncident: (incident: IncidentTypes.Incident) => void;
  public clearSelectedAssets: () => void;
  public clearForecasts: () => void;
  public clearTracks: () => void;
  public deselectAsset: (assetId: string) => void;
  public filterAssets: (filterQuery: Array<AssetTypes.AssetFilterQuery>) => void;
  public getAssetTrack: (assetId: string, movementId: string) => void;
  public getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  public getIncidentsForAssetId: (assetId: string) => void;
  public getLastFullPositionsForAsset: (
    assetId: string, amount: number, sources: ReadonlyArray<string>, excludeGivenSources?: boolean
  ) => void;
  public getLicenceForAsset: (assetId: string) => void;
  public getLogForIncident: (incidentId: number) => void;
  public getLatestPollsForAsset: (assetId: string) => void;
  public pollAsset: (assetId: string, pollPostObject: AssetTypes.PollPostObject) => void;
  public pollIncident: (incidentId: number, comment: string) => void;
  public removeForecast: (assetId: string) => void;
  public updateIncidentType: (incindentId: number, incidentType: IncidentTypes.IncidentTypes, expiryDate?: number) => void;
  public updateIncidentStatus: (incindentId: number, status: string, expiryDate?: number) => void;
  public updateIncidentExpiry: (incidentId: number, expiryDate: number) => void;
  public selectAsset: (assetId: string) => void;
  public dispatchSelectIncident: (incidentId: number) => void;
  public selectIncident: (incident: IncidentTypes.Incident) => void;
  public setActivePanel: (activeRightPanel: ReadonlyArray<string>) => void;
  public setActiveLeftPanelExtended: (activeLeftPanel: ReadonlyArray<string>) => void;
  public setActiveLeftPanel: (activeLeftPanel: ReadonlyArray<string>) => void;
  public setVisibilityForAssetNames: (visible: boolean) => void;
  public setVisibilityForAssetSpeeds: (visible: boolean) => void;
  public setVisibilityForForecast: (visible: boolean) => void;
  public setVisibilityForTracks: (visible: boolean) => void;
  public setVisibilityForFlags: (visible: boolean) => void;
  public untrackAsset: (assetId: string) => void;
  public saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;
  public saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) => void;
  public deleteMapLocation: (key: number) => void;

  private readonly unmount$: Subject<boolean> = new Subject<boolean>();

  public setActivePanelAndShowColumn = (activeRightPanel: ReadonlyArray<string>) => {
    if(this.columnHidden) {
      this.hideRightColumn(false);
    }
    this.setActivePanel(activeRightPanel);
  }

  public setActiveAssetToMatchIncident = () => {
    this.selectAsset(this.selectedIncident.assetId);
    return true;
  }

  public setActiveWorkflow = (workflow: string) => {
    this.setActiveLeftPanelExtended(['workflows', workflow]);
  }

  constructor(private readonly store: Store<any>) { }

  mapStateToProps() {
    this.store.select(MapSelectors.getActiveRightPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activePanel = activePanel;
    });
    this.store.select(MapSelectors.getActiveLeftPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activeLeftPanel = activePanel;
    });
    this.store.select(MapSelectors.getActiveInformationPanel).pipe(takeUntil(this.unmount$)).subscribe((activeInformationPanel) => {
      this.activeInformationPanel = activeInformationPanel;
    });
    this.addForecast = (assetId: string) =>
      this.store.dispatch(AssetActions.addForecast({ assetId }));
    this.forecasts$ = this.store.select(AssetSelectors.getForecasts);
    this.store.select(MapSettingsSelectors.getMapSettingsState).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.removeForecast = (assetId: string) =>
      this.store.dispatch(AssetActions.removeForecast({ assetId }));
    this.store.select(AssetSelectors.extendedDataForSelectedAssets).pipe(takeUntil(this.unmount$)).subscribe((selectedAssets) => {
      this.selectedAssets = selectedAssets;
      this.selectedAsset = this.selectedAssets.find(selectedAsset => selectedAsset.currentlyShowing);
    });
    this.store.select(IncidentSelectors.getSelectedIncident)
      .pipe(takeUntil(this.unmount$)).subscribe(selectedIncident => {
        this.selectedIncident = selectedIncident;
      });
    this.store.select(MapSettingsSelectors.getChoosenMovementSources)
      .pipe(takeUntil(this.unmount$)).subscribe(choosenMovementSources => {
        this.choosenMovementSources = choosenMovementSources;
      });
    this.store.select(MapSavedFiltersSelectors.getAssetGroupFilters)
      .pipe(takeUntil(this.unmount$)).subscribe(assetGroupFilters => {
        this.assetGroupFilters = assetGroupFilters;
      });
    this.store.select(IncidentSelectors.getIncidentLogs)
      .pipe(takeUntil(this.unmount$)).subscribe(incidentLogs => {
        this.incidentLogs = incidentLogs;
      });
    this.store.select(IncidentSelectors.getIncidentsForAssets)
      .pipe(takeUntil(this.unmount$)).subscribe(incidentsForAssets => {
        this.incidentsForAssets = incidentsForAssets;
      });
    this.store.select(AssetSelectors.getSelectedAssetsLastPositions)
      .pipe(takeUntil(this.unmount$)).subscribe(selectedAssetsLastPositions => {
        this.selectedAssetsLastPositions = selectedAssetsLastPositions;
      });
    this.mapStatistics$ = this.store.select(AssetSelectors.getMapStatistics);
    this.mapLayers$ = this.store.select(MapLayersSelectors.getMapLayers);
    this.activeMapLayers$ = this.store.select(MapLayersSelectors.getActiveLayers);
    this.licence$ = this.store.select(AssetSelectors.getLicenceForSelectedMapAsset).pipe(tap((licence) => {
      this.licenceLoaded = true;
    }));
    this.incidentTypes$ = this.store.select(IncidentSelectors.getIncidentTypes);
    this.lastFullPositionsForSelectedAsset$ = this.store.select(AssetSelectors.getLastFullPositionsForSelectedAsset);
    this.lastPollsForSelectedAsset$ = this.store.select(AssetSelectors.getLastPollsForSelectedAsset).pipe(tap((polls) => {
      polls.reduce((acc, poll) => {
        if(!acc.includes(poll.pollInfo.mobileterminalId)) {
          return [ ...acc, poll.pollInfo.mobileterminalId ];
        }
        return acc;
      }, []).map((mobileTerminalId) => {
        this.store.dispatch(MobileTerminalActions.getMobileTerminal({ mobileTerminalId }));
      });
    }));
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  mapDispatchToProps() {
    this.addActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.addActiveLayer({ layerName }));
    this.setActiveLeftPanelExtended = (activeLeftPanel: ReadonlyArray<string>) => {
      this.store.dispatch(AssetActions.clearAllButPrimarySelectedAssets());
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
      this.store.dispatch(AssetActions.removeTracks());
    };

    this.clearNotificationsForIncident = (incident: IncidentTypes.Incident) =>
      this.store.dispatch(IncidentActions.clearNotificationsForIncident({ incident }));
    this.clearSelectedAssets = () =>
      this.store.dispatch(AssetActions.clearSelectedAssets());
    this.clearForecasts = () =>
      this.store.dispatch(AssetActions.clearForecasts());
    this.clearTracks = () =>
      this.store.dispatch(AssetActions.clearTracks());
    this.deselectAsset = (assetId) => {
      if(this.selectedAssets.length === 1) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['information'] }));
      } else if(this.selectedAssets.length === 2) {
        this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] }));
      }
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    };
    this.filterAssets = (filterQuery: Array<AssetTypes.AssetFilterQuery>) =>
      this.store.dispatch(AssetActions.setFilterQuery({filterQuery}));
    this.getLastFullPositionsForAsset = (assetId: string, amount: number, sources: ReadonlyArray<string>, excludeGivenSources?: boolean ) =>
      this.store.dispatch(AssetActions.getLastFullPositionsForAsset({ assetId, amount, sources, excludeGivenSources }));
    this.dispatchSelectIncident = (incidentId: number) =>
      this.store.dispatch(IncidentActions.selectIncident({ incidentId }));
    this.getAssetTrack = (assetId: string, movementId: string) =>
      this.store.dispatch(AssetActions.getAssetTrack({ assetId, movementId }));
    this.getAssetTrackTimeInterval = (assetId, startDate, endDate) =>
      this.store.dispatch(AssetActions.getAssetTrackTimeInterval({ assetId, startDate, endDate, sources: this.choosenMovementSources }));
    this.getIncidentsForAssetId = (assetId) =>
      this.store.dispatch(IncidentActions.getIncidentsForAssetId({ assetId }));
    this.getLogForIncident = (incidentId: number) =>
      this.store.dispatch(IncidentActions.getLogForIncident({ incidentId }));
    this.getLicenceForAsset = (assetId: string) => {
      this.licenceLoaded = false;
      this.store.dispatch(AssetActions.getLicenceForAsset({ assetId }));
    };
    this.getLatestPollsForAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.getLatestPollsForAsset({ assetId }));
    this.untrackAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.untrackAsset({ assetId }));
    this.saveMapLocation = (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) =>
      this.store.dispatch(MapSettingsActions.saveMapLocation({ key, mapLocation, save }));
    this.deleteMapLocation = (key: number) =>
      this.store.dispatch(MapSettingsActions.deleteMapLocation({ key }));
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
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.setActivePanel = (activeRightPanel: ReadonlyArray<string>) =>
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    this.setActiveLeftPanel = (activeLeftPanel: ReadonlyArray<string>) =>
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
    this.createManualMovement = (manualMovement: AssetTypes.ManualMovement) => {
      return this.store.dispatch(AssetActions.createManualMovement({ manualMovement }));
    };
    this.updateIncidentType = (incidentId: number, incidentType: IncidentTypes.IncidentTypes, expiryDate?: number) =>
      this.store.dispatch(IncidentActions.updateIncidentType({ incidentId, incidentType, expiryDate }));
    this.updateIncidentStatus = (incidentId: number, status: string, expiryDate?: number) =>
      this.store.dispatch(IncidentActions.updateIncidentStatus({ incidentId, status, expiryDate }));
    this.updateIncidentExpiry = (incidentId: number, expiryDate: number) =>
      this.store.dispatch(IncidentActions.updateIncidentExpiry({ incidentId, expiryDate }));
    this.pollAsset = (assetId: string, pollPostObject: AssetTypes.PollPostObject) =>
      this.store.dispatch(AssetActions.pollAsset({ assetId, pollPostObject }));
    this.pollIncident = (incidentId: number, comment: string) =>
      this.store.dispatch(IncidentActions.pollIncident({ incidentId, comment }));
    this.createNote = (note: NotesTypes.NoteParameters) =>
      this.store.dispatch(NotesActions.saveNote({ note }));
    this.createIncidentNote = (incidentId: number, note: NotesTypes.NoteParameters) =>
      this.store.dispatch(IncidentActions.createNote({ incidentId, note }));
    this.removeActiveLayer = (layerName: string) =>
      this.store.dispatch(MapLayersActions.removeActiveLayer({ layerName }));
    this.saveFilter = (filter: MapSavedFiltersTypes.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.saveFilter({ filter }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.selectIncident = (incident: IncidentTypes.Incident) => {
      this.selectAsset(incident.assetId);
      this.dispatchSelectIncident(incident.id);
      this.clearNotificationsForIncident(incident);
      this.setActivePanel(['incident']);
    };
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  incidentLogIfItExists() {
    return typeof this.selectedIncident !== 'undefined'
      ? this.incidentLogs[this.selectedIncident.id]
      : undefined;
  }

  checkIfSecondaryPanelIsActive() {
    return typeof this.activePanel[1] !== 'undefined';
  }

  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
  }

  public createNoteWithIncidentId = (note: NotesTypes.NoteParameters) => {
    return this.createIncidentNote(this.selectedIncident.id, note);
  }
}
