import { Component, Input, OnChanges } from '@angular/core';

import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { AssetTypes } from '@data/asset';

@Component({
  selector: 'map-incident-log-entry-position',
  templateUrl: './incident-log-entry-position.component.html',
  styleUrls: ['./incident-log-entry-position.component.scss']
})
export class IncidentLogEntryPositionComponent implements OnChanges {
  @Input() position: AssetTypes.Movement;
  @Input() incidentClosed: boolean;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedPosition: AssetTypes.Movement & {
    formattedLocation: {
      latitude: string,
      longitude: string
    },
    formattedTimestamp: string
  };

  ngOnChanges() {
    const formattedLatLong = convertDDToDDM(this.position.location.latitude, this.position.location.longitude);
    this.formattedPosition = {
      ...this.position,
      formattedLocation: {
        latitude: formattedLatLong.latitude,
        longitude: formattedLatLong.longitude,
      },
      formattedTimestamp: formatUnixtime(this.position.timestamp)
    };
  }
}
