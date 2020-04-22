import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetTypes } from '@data/asset';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'map-add-to-asset-group-dialog',
  templateUrl: './add-to-asset-group-dialog.component.html',
  styleUrls: ['./add-to-asset-group-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddToAssetGroupDialogComponent {

  public createNew = false;
  public newGroupNameDecided = false;
  public newGroupName = new FormControl('', Validators.required);
  public selectedGroup: string;

  private assetGroupFilters: Readonly<{ [id: string]: MapSavedFiltersTypes.SavedFilter }>;

  constructor(
    public dialogRef: MatDialogRef<AddToAssetGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      selectedAssets: ReadonlyArray<AssetTypes.AssetData>,
      assetGroupFilters: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>
    }
  ) {
    this.assetGroupFilters = this.data.assetGroupFilters.reduce((acc, assetGroupFilter) => {
      return { ...acc, [assetGroupFilter.id]: assetGroupFilter };
    }, {});
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteNewGroup() {
    this.createNew = false;
    this.newGroupNameDecided = false;
    if(this.selectedGroup === 'new') {
      this.selectedGroup = null;
    }
  }

  returnUpdatedGroup() {
    if(this.selectedGroup === 'new') {
      return {
        name: this.newGroupName.value,
        filter: [{
          inverse: false,
          isNumber: false,
          type: 'GUID',
          values: this.data.selectedAssets.map(asset => asset.asset.id)
        }]
      };
    } else if(typeof this.assetGroupFilters[this.selectedGroup] !== 'undefined') {
      return {
        ...this.assetGroupFilters[this.selectedGroup],
        filter: this.assetGroupFilters[this.selectedGroup].filter.map((filter: MapSavedFiltersTypes.AssetFilterQuery) => {
          if(filter.type !== 'GUID') {
            return filter;
          } else {
            return {
              ...filter,
              values: [ ...filter.values, ...this.data.selectedAssets.map(asset => asset.asset.id)]
            };
          }
        }),
      };
    }
  }
}
