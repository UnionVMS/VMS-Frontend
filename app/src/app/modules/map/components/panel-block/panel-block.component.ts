import { Component, Input, OnChanges, ContentChild, ElementRef } from '@angular/core';

@Component({
  selector: 'map-panel-block',
  templateUrl: './panel-block.component.html',
  styleUrls: ['./panel-block.component.scss']
})
export class PanelBlockComponent implements OnChanges {
  @Input() blockTitle: string;
  @Input() active: boolean;
  @Input() noExternalPadding: boolean;
  @Input() noContentPadding: boolean;
  // tslint:disable-next-line:no-inferrable-types
  @Input() useArrowsAsToggle: boolean = false;

  @Input() setActiveFunction: (status: boolean) => void;

  @Input() showFooter = false;
  @Input() unstyledFooter = false;

  public switchFunction: () => void;

  ngOnChanges() {
    // console.warn(this.showFooter);
    this.switchFunction = () => this.setActiveFunction(!this.active);
  }
}
