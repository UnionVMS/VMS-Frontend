import { Component, Input } from '@angular/core';


@Component({
  selector: 'map-distance-between-points-panel',
  templateUrl: './distance-between-points-panel.component.html',
  styleUrls: ['./distance-between-points-panel.component.scss'],
})
export class DistanceBetweenPointsPanelComponent {
  @Input() clearMessurements: () => void;

  clear() {
    this.clearMessurements();
  }
}
