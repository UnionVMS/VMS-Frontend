import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import Map from 'ol/Map';

import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentTypes, IncidentSelectors } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { NotesActions, NotesTypes } from '@data/notes';
import { MapSavedFiltersActions, MapSavedFiltersTypes, MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { MapSettingsTypes, MapSettingsSelectors } from '@data/map-settings';


@Component({
  selector: 'map-right-column',
  templateUrl: './map-right-column.component.html',
  styleUrls: ['./map-right-column.component.scss']
})
export class MapRightColumnComponent implements OnInit, OnDestroy {

  @Input() centerMapOnPosition: (position: Position) => void;
  @Input() map: Map;

  public activePanel: string;
  public activeLeftPanel: string;
  public assetsNotSendingIncidents: Readonly<{ [assetId: string]: IncidentTypes.assetNotSendingIncident }>;
  public mapSettings: MapSettingsTypes.State;
  public forecasts$: Observable<any>;
  public selectedAsset: Readonly<AssetTypes.AssetData>;
  public selectedAssets: ReadonlyArray<AssetTypes.AssetData>;
  public choosenMovementSources: ReadonlyArray<string>;
  public assetGroupFilters: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>;

  public addForecast: (assetId: string) => void;
  public createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  public createNote: (note: NotesTypes.Note) => void;
  public clearSelectedAssets: () => void;
  public deselectAsset: (assetId: string) => void;
  public getAssetTrack: (assetId: string, movementGuid: string) => void;
  public getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  public removeForecast: (assetId: string) => void;
  public saveNewIncidentStatus: (incidentId: number, status: string) => void;
  public selectAsset: (assetId: string) => void;
  public setActivePanel: (activeRightPanel: string) => void;
  public untrackAsset: (assetId: string) => void;
  public saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;

  private readonly unmount$: Subject<boolean> = new Subject<boolean>();

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
    this.store.select(IncidentSelectors.getAssetNotSendingIncidentsByAssetId)
      .pipe(takeUntil(this.unmount$)).subscribe(assetsNotSendingIncicents => {
        this.assetsNotSendingIncidents = assetsNotSendingIncicents;
      });
    this.store.select(MapSettingsSelectors.getChoosenMovementSources)
      .pipe(takeUntil(this.unmount$)).subscribe(choosenMovementSources => {
        this.choosenMovementSources = choosenMovementSources;
      });
    this.store.select(MapSavedFiltersSelectors.getAssetGroupFilters)
      .pipe(takeUntil(this.unmount$)).subscribe(assetGroupFilters => {
        this.assetGroupFilters = assetGroupFilters;
      });
  }

  mapDispatchToProps() {
    this.clearSelectedAssets = () =>
      this.store.dispatch(AssetActions.clearSelectedAssets());
    this.deselectAsset = (assetId) =>
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    this.getAssetTrack = (assetId: string, movementGuid: string) =>
      this.store.dispatch(AssetActions.getAssetTrack({ assetId, movementGuid }));
    this.getAssetTrackTimeInterval = (assetId, startDate, endDate) =>
      this.store.dispatch(AssetActions.getAssetTrackTimeInterval({ assetId, startDate, endDate, sources: this.choosenMovementSources }));
    this.untrackAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.untrackAsset({ assetId }));
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.setActivePanel = (activeRightPanel: string) =>
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    this.createManualMovement = (manualMovement: AssetTypes.ManualMovement) => {
      return this.store.dispatch(AssetActions.createManualMovement({ manualMovement }));
    };
    this.saveNewIncidentStatus = (incidentId: number, status: string) => {
      return this.store.dispatch(IncidentActions.saveNewIncidentStatus({ incidentId, status }));
    };
    this.createNote = (note: NotesTypes.Note) =>
      this.store.dispatch(NotesActions.saveNote({ note }));
    this.saveFilter = (filter: MapSavedFiltersTypes.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.saveFilter({ filter }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }
}
