import { Component, Input } from '@angular/core';

@Component({
  selector: 'asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset;
  @Input() getAssetTrack;

  private hidePanel = false;
}
