import { Component, Input } from '@angular/core';
import * as AssetInterfaces from '@data/asset/asset.interfaces';

@Component({
  selector: 'map-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.scss']
})
export class TopPanelComponent {
  // tslint:disable:ban-types
  @Input() autocompleteFunction: Function;
  @Input() centerMapOnPosition: Function;
  @Input() selectAsset: Function;
  @Input() filterFunction: Function;
  // tslint:enable:ban-types
  @Input() autocompleteResult: Array<AssetInterfaces.AssetMovementWithEssentials>;
  @Input() currentControlPanel: string|null;
  @Input() setCurrentControlPanel: (controlPanelName: string|null) => void;
  @Input() hidePanelButtons: Array<string>;

  public toggleCurrentControlPanel(componentName) {
    this.setCurrentControlPanel(this.currentControlPanel === componentName ? null : componentName);
  }

  public canShowButton = (panel) => typeof this.hidePanelButtons === 'undefined' || !this.hidePanelButtons.includes(panel);
}
