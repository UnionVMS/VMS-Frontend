import { Component, Input } from '@angular/core';

@Component({
  selector: 'asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset;
  @Input() getAssetTrack;
  @Input() untrackAsset;

  private hidePanel = false;
  private toggleVisibility: Function = () => {
    this.hidePanel = !this.hidePanel;
  }
}
