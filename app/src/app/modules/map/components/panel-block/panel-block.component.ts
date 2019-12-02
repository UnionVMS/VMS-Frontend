import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'map-panel-block',
  templateUrl: './panel-block.component.html',
  styleUrls: ['./panel-block.component.scss']
})
export class PanelBlockComponent implements OnChanges {
  @Input() blockTitle: string;
  @Input() active: boolean;
  @Input() setActiveFunction: (status: boolean) => void;
  // tslint:disable-next-line:no-inferrable-types
  @Input() useArrowsAsToggle: boolean = false;

  public switchFunction: () => void;

  ngOnChanges() {
    // console.warn(this.useArrowsAsToggle);
    this.switchFunction = () => this.setActiveFunction(!this.active);
  }
}
