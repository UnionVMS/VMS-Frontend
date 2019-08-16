import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';
import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'map-track-panel',
  templateUrl: './track-panel.component.html',
  styleUrls: ['./track-panel.component.scss']
})
export class TrackPanelComponent {
  @Input() positions: { [id: number]: AssetInterfaces.Movement };
  @Input() removePositionForInspection: (inspectionId: string) => void;

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
