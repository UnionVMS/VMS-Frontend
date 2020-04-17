import { Component, Input, TemplateRef } from '@angular/core';
import { MapSavedFiltersInterfaces } from '@data/map-saved-filters';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'map-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent {
  @Input() assetGroups: Array<MapSavedFiltersInterfaces.SavedFilter>;
  @Input() selectedAssetGroups: Array<string>;
  @Input() setAssetGroup: (assetGroup: string) => void;
  @Input() clearAssetGroup: (assetGroup: string) => void;
  @Input() deleteFilter: (filterId: string) => void;

  constructor(private dialog: MatDialog) {}

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
}
