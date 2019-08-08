import { Component, Input } from '@angular/core';

@Component({
  selector: 'map-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent {
  @Input() assetGroups: any;
  private toggleGroup = (assetGroup): void => {
    console.warn('Blupp blupp!', assetGroup);
  }
}
