import { Component, Input, OnChanges } from '@angular/core';
import { MapSavedFiltersInterfaces } from '@data/map-saved-filters';


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

  public toggleGroup = (assetGroupId: string): void => {
    if(this.selectedAssetGroups.includes(assetGroupId)) {
      this.clearAssetGroup(assetGroupId);
    } else {
      this.setAssetGroup(assetGroupId);
    }
  }
}
