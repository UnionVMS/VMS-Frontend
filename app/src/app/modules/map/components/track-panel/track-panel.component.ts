import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';

@Component({
  selector: 'map-track-panel',
  templateUrl: './track-panel.component.html',
  styleUrls: ['./track-panel.component.scss']
})
export class TrackPanelComponent {
  @Input() positions: any;
  // tslint:disable-next-line:ban-types
  @Input() removePositionForInspection: Function;

  public hidePanel = true;
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  positionKeys() {
    return Object.keys(this.positions);
  }

  getFormatedDate(date) {
    return formatDate(date);
  }
}
