import { Component, Input } from '@angular/core';

@Component({
  selector: 'map-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent {
  public hidePanel = false;
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }
}
