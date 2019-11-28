import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';
import * as AssetInterfaces from '@data/asset/asset.interfaces';

@Component({
  selector: 'map-panel-block',
  templateUrl: './panel-block.component.html',
  styleUrls: ['./panel-block.component.scss']
})
export class PanelBlockComponent implements OnChanges {
  @Input() blockTitle: string;
  @Input() active: boolean;
  @Input() setActiveFunction: (status: boolean) => void;

  public switchFunction;

  ngOnChanges() {
    this.switchFunction = () => this.setActiveFunction(!this.active);
  }
}
