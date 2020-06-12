import { Component, Input } from '@angular/core';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { AssetTypes } from '@data/asset';

@Component({
  selector: 'map-incident-log-entry-position',
  templateUrl: './incident-log-entry-position.component.html',
  styleUrls: ['./incident-log-entry-position.component.scss']
})
export class IncidentLogEntryPositionComponent {
  @Input() position: AssetTypes.Movement;
  @Input() incidentClosed: boolean;


  formatDate(unixtime: number) {
    return formatUnixtime(unixtime);
  }
}
