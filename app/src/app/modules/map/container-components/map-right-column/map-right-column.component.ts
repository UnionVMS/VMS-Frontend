import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import getContryISO2 from 'country-iso-3-to-2';

import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';
import { MapActions, MapSelectors } from '@data/map';
import { NotesActions, NotesInterfaces } from '@data/notes';
import { MapSavedFiltersActions, MapSavedFiltersInterfaces, MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { MapSettingsInterfaces, MapSettingsSelectors } from '@data/map-settings';


@Component({
  selector: 'map-right-column',
  templateUrl: './map-right-column.component.html',
  styleUrls: ['./map-right-column.component.scss']
})
export class MapRightColumnComponent implements OnInit, OnDestroy {

  @Input() centerMapOnPosition: (position: Position) => void;

  public activePanel: string;
  public assetsNotSendingIncidents: Readonly<{ [assetId: string]: AssetInterfaces.assetNotSendingIncident }>;
  public mapSettings: MapSettingsInterfaces.State;
  public forecasts$: Observable<any>;
  public selectedAsset: Readonly<AssetInterfaces.AssetData>;
  public selectedAssets: ReadonlyArray<AssetInterfaces.AssetData>;

  public addForecast: (assetId: string) => void;
  public createManualMovement: (manualMovement: AssetInterfaces.ManualMovement) => void;
  public createNote: (note: NotesInterfaces.Note) => void;
  public deselectAsset: (assetId: string) => void;
  public getAssetTrack: (assetId: string, movementGuid: string) => void;
  public getAssetTrackTimeInterval: (assetId: string, startDate: string, endDate: string) => void;
  public removeForecast: (assetId: string) => void;
  public saveNewIncidentStatus: (incidentId: number, status: string) => void;
  public selectAsset: (assetId: string) => void;
  public setActivePanel: (activeRightPanel: string) => void;
  public untrackAsset: (assetId: string) => void;

  private unmount$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<any>) { }

  mapStateToProps() {
    this.store.select(MapSelectors.getActiveRightPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activePanel = activePanel;
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
    this.store.select(AssetSelectors.getAssetNotSendingIncidentsByAssetId)
      .pipe(takeUntil(this.unmount$)).subscribe(assetsNotSendingIncicents => {
        console.warn(assetsNotSendingIncicents);
        this.assetsNotSendingIncidents = assetsNotSendingIncicents;
      });
  }

  mapDispatchToProps() {
    this.deselectAsset = (assetId) =>
      this.store.dispatch(AssetActions.deselectAsset({ assetId }));
    this.getAssetTrack = (assetId: string, movementGuid: string) =>
      this.store.dispatch(AssetActions.getAssetTrack({ assetId, movementGuid }));
    this.getAssetTrackTimeInterval = (assetId, startDate, endDate) =>
      this.store.dispatch(AssetActions.getAssetTrackTimeInterval({ assetId, startDate, endDate }));
    this.untrackAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.untrackAsset({ assetId }));
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.setActivePanel = (activeRightPanel: string) =>
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    this.createManualMovement = (manualMovement: AssetInterfaces.ManualMovement) => {
      return this.store.dispatch(AssetActions.createManualMovement({ manualMovement }));
    };
    this.saveNewIncidentStatus = (incidentId: number, status: string) => {
      return this.store.dispatch(AssetActions.saveNewIncidentStatus({ incidentId, status }));
    };
    this.createNote = (note: NotesInterfaces.Note) =>
      this.store.dispatch(NotesActions.saveNote({ note }));
  }

  selectAssetWrapper(assetId) {
    return () => this.selectAsset(assetId);
  }
  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
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
