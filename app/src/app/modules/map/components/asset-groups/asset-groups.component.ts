import { Component, Input, OnChanges } from '@angular/core';
import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'map-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent implements OnChanges {
  @Input() assetGroups: Array<AssetInterfaces.AssetGroup>;
  @Input() selectedAssetGroups: Array<AssetInterfaces.AssetGroup>;
  @Input() setAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;
  @Input() clearAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;

  public selectedAssetGroupIds: ReadonlyArray<string>;

  ngOnChanges() {
    this.selectedAssetGroupIds = this.selectedAssetGroups.map(assetGroup => assetGroup.id);
  }

  private toggleGroup = (assetGroup): void => {
    if(this.selectedAssetGroups.some((selectedAssetGroup) => selectedAssetGroup.id === assetGroup.id)) {
      this.clearAssetGroup(assetGroup);
    } else {
      this.setAssetGroup(assetGroup);
    }
  }
}
