import { Component, Input, TemplateRef } from '@angular/core';
import { AssetTypes } from '@data/asset';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { MatDialog } from '@angular/material/dialog';
import { EditAssetGroupDialogComponent } from '@modules/map/components/edit-asset-group-dialog/edit-asset-group-dialog.component';

@Component({
  selector: 'map-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent {
  @Input() assetGroups: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>;
  @Input() assetEssentials: Readonly<{ readonly [assetId: string]: AssetTypes.AssetEssentialProperties }>;
  @Input() selectedAssetGroups: Array<string>;
  @Input() setAssetGroup: (assetGroup: string) => void;
  @Input() clearAssetGroup: (assetGroup: string) => void;
  @Input() deleteFilter: (filterId: string) => void;
  @Input() saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;

  constructor(private readonly dialog: MatDialog) {}

  public toggleGroup = (assetGroupId: string): void => {
    if(this.selectedAssetGroups.includes(assetGroupId)) {
      this.clearAssetGroup(assetGroupId);
    } else {
      this.setAssetGroup(assetGroupId);
    }
  }

  openDialog(templateRef: TemplateRef<any>, actionFunction: (id: string) => void, id: string) {
    const dialogRef = this.dialog.open(templateRef);
    dialogRef.afterClosed().subscribe(result => {
      if(result === true) {
        actionFunction(id);
      }
    });
  }

  openEditDialog(assetGroupFilter: MapSavedFiltersTypes.SavedFilter) {
    const dialogRef = this.dialog.open(EditAssetGroupDialogComponent, {
      data: { assetGroupFilter, assetEssentials: this.assetEssentials }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(typeof result !== 'undefined' && typeof result !== 'string') {
        this.saveFilter(result);
      }
    });
  }
}
