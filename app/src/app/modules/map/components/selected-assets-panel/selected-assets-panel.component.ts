import { Component, Input } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';
import { MatDialog } from '@angular/material/dialog';

import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { AddToAssetGroupDialogComponent } from '../add-to-asset-group-dialog/add-to-asset-group-dialog.component';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';

@Component({
  selector: 'map-selected-assets-panel',
  templateUrl: './selected-assets-panel.component.html',
  styleUrls: ['./selected-assets-panel.component.scss']
})
export class SelectedAssetsPanelComponent {

  @Input() selectedAssets: ReadonlyArray<AssetTypes.AssetData>;
  @Input() selectAsset: (assetId: string) => void;
  @Input() clearSelectedAssets: () => void;
  @Input() deselectAsset: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (position: Position) => void;
  @Input() assetGroupFilters: Readonly<{ [id: string]: MapSavedFiltersTypes.SavedFilter }>;
  @Input() saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;

  public showControlPanel = false;

  public toggleControlPanel = () => {
    this.showControlPanel = !this.showControlPanel;
  }

  constructor(public dialog: MatDialog) { }

  getCountryCode(asset) {
    const countryCode = getContryISO2(asset.asset.flagStateCode);
    if(typeof countryCode === 'undefined') {
      return '???';
    }
    return countryCode.toLowerCase();
  }

  selectAssetWrapper(assetId) {
    return () => this.selectAsset(assetId);
  }

  trackBySelectedAssets(index: number, asset: AssetTypes.AssetData) {
    return asset.asset.id;
  }

  openAddToAssetGroupDialog(): void {
    const dialogRef = this.dialog.open(AddToAssetGroupDialogComponent, {
      data: { selectedAssets: this.selectedAssets, assetGroupFilters: this.assetGroupFilters },
      panelClass: 'dialog-without-padding'
    });

    dialogRef.afterClosed().subscribe(resultDetach => {
      console.warn(resultDetach);
      if(typeof resultDetach !== 'undefined' && resultDetach !== '') {
        this.saveFilter(resultDetach);
      }
    });
  }
}
