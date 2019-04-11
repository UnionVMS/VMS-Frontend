import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';

@Component({
  selector: 'track-panel',
  templateUrl: './track-panel.component.html',
  styleUrls: ['./track-panel.component.scss']
})
export class TrackPanelComponent {
  @Input() positions: any;
  @Input() removePositionForInspection: Function;

  public hidePanel = true;
  private toggleVisibility: Function = () => {
    this.hidePanel = !this.hidePanel;
  }

  positionKeys() {
    return Object.keys(this.positions);
  }

  getFormatedDate(date) {
    return formatDate(date);
  }
}
