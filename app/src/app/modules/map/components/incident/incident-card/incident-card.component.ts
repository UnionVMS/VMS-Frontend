import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { take, map, finalize } from 'rxjs/operators';

import { IncidentTypes } from '@data/incident';
import { Position } from '@data/generic.types';
import { MovementStatusTranslation } from '@data/asset/asset.types';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

@Component({
  selector: 'map-incident-card',
  templateUrl: './incident-card.component.html',
  styleUrls: ['./incident-card.component.scss']
})
export class IncidentCardComponent implements OnChanges, OnDestroy {
  @Input() incident: IncidentTypes.Incident;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() incidentIsSelected: boolean;
  @Input() urgency: IncidentTypes.IncidentRisk;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  @Input() countdownFrom?: number;
  @Input() countdownTo?: number;

  public formattedIncident: IncidentTypes.Incident & {
    formattedDate: string;
    formattedCoordinates: string;
    lastKnownLocationStatus?: string;
    lastKnownLocationStatusDescription?: string;
  };

  public countdownLength: number;
  public countdown: number;

  public counterSubscription: Subscription;
  public count: number;

  ngOnChanges() {
    this.countdown = undefined;
    this.countdownLength = 0;

    if(this.countdownTo !== undefined) {
      if(this.countdownFrom !== undefined) {
        this.countdownLength = (this.countdownTo - this.countdownFrom) / (60 * 1000); // in minutes
      }

      this.countdown = (Date.now() - this.countdownTo) / (60 * 1000); // in minutes

      this.count = Math.floor(this.countdown);
      const interval = 60 * 1000; // Tick up every minute
      const startAt = interval * (this.countdown % 1);

      if(typeof this.counterSubscription !== 'undefined') {
        this.counterSubscription.unsubscribe();
      }

      this.counterSubscription = timer(startAt, interval).subscribe(() => {
        this.countdown = (Date.now() - this.countdownTo) / (60 * 1000); // in minutes
        ++this.count;
      });
    }
    if(typeof this.incident.lastKnownLocation !== 'undefined') {
      const formattedLocation = convertDDToDDM(
        this.incident.lastKnownLocation.location.latitude,
        this.incident.lastKnownLocation.location.longitude,
        2
      );

      const lastKnownLocationStatusDescription = this.incident.lastKnownLocation.status + ' - ' + (
        (
          typeof this.incident.lastKnownLocation.status !== 'undefined'
          && typeof MovementStatusTranslation[this.incident.lastKnownLocation.status] !== 'undefined'
        )
        ? MovementStatusTranslation[this.incident.lastKnownLocation.status]
        : 'No such code'
      );
      this.formattedIncident = {
        ...this.incident,
        formattedDate: formatUnixtimeWithDot(this.incident.lastKnownLocation.timestamp),
        formattedCoordinates: formattedLocation.latitude + ', ' + formattedLocation.longitude,
        lastKnownLocationStatus: this.incident.lastKnownLocation.status,
        lastKnownLocationStatusDescription
      };
    } else {
      this.formattedIncident = {
        ...this.incident,
        formattedDate: '-',
        formattedCoordinates: '-'
      };
    }
  }

  ngOnDestroy() {
    if(typeof this.counterSubscription !== 'undefined') {
      this.counterSubscription.unsubscribe();
    }
  }

  getProgress() {
    if(this.countdownLength <= 0) {
      return -1;
    }
    return -this.countdown / this.countdownLength * 100;
  }

  floor(val: number) {
    return Math.floor(val);
  }
}
