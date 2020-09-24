import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Map from 'ol/Map';
import getContryISO2 from 'country-iso-3-to-2';

import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentTypes, IncidentSelectors } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { NotesActions, NotesTypes } from '@data/notes';
import { MapSavedFiltersActions, MapSavedFiltersTypes, MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { MapSettingsTypes, MapSettingsSelectors } from '@data/map-settings';
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

  public activePanel: ReadonlyArray<string>;
  public activeLeftPanel: ReadonlyArray<string>;
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
  public lastFullPositionsForSelectedAsset$: Observable<ReadonlyArray<AssetTypes.FullMovement>>;
  public licence$: Observable<AssetTypes.AssetLicence>;
  public licenceLoaded = false;
  public userTimezone$: Observable<string>;

  public addForecast: (assetId: string) => void;
  public createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  public createNote: (note: NotesTypes.Note) => void;
  public createIncidentNote: (incidentId: number, note: NotesTypes.Note) => void;
  public clearNotificationsForIncident: (incident: IncidentTypes.Incident) => void;
  public clearSelectedAssets: () => void;
  public clearForecasts: () => void;
  public clearTracks: () => void;
  public deselectAsset: (assetId: string) => void;
  public getAssetTrack: (assetId: string, movementId: string) => void;
  public getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  public getIncidentsForAssetId: (assetId: string) => void;
  public getLastFullPositionsForAsset: (assetId: string, amount: number, sources: ReadonlyArray<string>) => void;
  public getLicenceForAsset: (assetId: string) => void;
  public getLogForIncident: (incidentId: number) => void;
  public pollAsset: (assetId: string, comment: string) => void;
  public pollIncident: (incidentId: number, comment: string) => void;
  public removeForecast: (assetId: string) => void;
  public saveIncident: (incident: IncidentTypes.Incident) => void;
  public selectAsset: (assetId: string) => void;
  public dispatchSelectIncident: (incidentId: number) => void;
  public selectIncident: (incident: IncidentTypes.Incident) => void;
  public setActivePanel: (activeRightPanel: ReadonlyArray<string>) => void;
  public setActiveLeftPanelExtended: (activeLeftPanel: ReadonlyArray<string>) => void;
  public setActiveLeftPanel: (activeLeftPanel: ReadonlyArray<string>) => void;
  public untrackAsset: (assetId: string) => void;
  public saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;

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
    this.licence$ = this.store.select(AssetSelectors.getLicenceForSelectedMapAsset).pipe(tap((licence) => {
      this.licenceLoaded = true;
    }));
    this.incidentTypes$ = this.store.select(IncidentSelectors.getIncidentTypes);
    this.lastFullPositionsForSelectedAsset$ = this.store.select(AssetSelectors.getLastFullPositionsForSelectedAsset);
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  mapDispatchToProps() {
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
    this.getLastFullPositionsForAsset = (assetId: string, amount: number, sources: ReadonlyArray<string>) =>
      this.store.dispatch(AssetActions.getLastFullPositionsForAsset({ assetId, amount, sources }));
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
    this.untrackAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.untrackAsset({ assetId }));
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.setActivePanel = (activeRightPanel: ReadonlyArray<string>) =>
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    this.setActiveLeftPanel = (activeLeftPanel: ReadonlyArray<string>) =>
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
    this.createManualMovement = (manualMovement: AssetTypes.ManualMovement) => {
      return this.store.dispatch(AssetActions.createManualMovement({ manualMovement }));
    };
    this.saveIncident = (incident: IncidentTypes.Incident) =>
      this.store.dispatch(IncidentActions.saveIncident({ incident }));
    this.pollAsset = (assetId: string, comment: string) =>
      this.store.dispatch(AssetActions.pollAsset({ assetId, comment }));
    this.pollIncident = (incidentId: number, comment: string) =>
      this.store.dispatch(IncidentActions.pollIncident({ incidentId, comment }));
    this.createNote = (note: NotesTypes.Note) =>
      this.store.dispatch(NotesActions.saveNote({ note }));
    this.createIncidentNote = (incidentId: number, note: NotesTypes.Note) =>
      this.store.dispatch(IncidentActions.createNote({ incidentId, note }));
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

  public createNoteWithId = (note: NotesTypes.Note) => {
    return this.createIncidentNote(this.selectedIncident.id, { ...note, assetId: this.selectedAsset.asset.id });
  }
}
