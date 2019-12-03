import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import getContryISO2 from 'country-iso-3-to-2';

import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';
import { MapActions, MapSelectors } from '@data/map';
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
  public setActivePanel: (activeRightPanel: string) => void;

  public deselectAsset: (assetId: string) => void;
  private forecasts$: Observable<any>;
  public selectedAssets: ReadonlyArray<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  }>;
  public selectAsset: (assetId: string) => void;
  private getAssetTrack: (assetId: string, movementGuid: string) => void;
  private getAssetTrackTimeInterval: (assetId: string, startDate: string, endDate: string) => void;
  private untrackAsset: (assetId: string) => void;

  public addForecast: (assetId: string) => void;
  private removeForecast: (assetId: string) => void;
  public mapSettings: MapSettingsInterfaces.State;

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
    this.store.select(AssetSelectors.extendedDataForSelectedAssets).subscribe((selectedAssets) => {
      this.selectedAssets = selectedAssets;
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
