import { Component, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import Map from 'ol/Map';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import { AssetTypes } from '@data/asset';
import { IncidentTypes } from '@data/incident';
import { NotesTypes } from '@data/notes';
import { Position } from '@data/generic.types';


@Component({
  selector: 'map-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IncidentComponent implements OnChanges {
  @Input() asset: AssetTypes.AssetData;
  @Input() incident: IncidentTypes.assetNotSendingIncident;
  @Input() incidentLog: IncidentTypes.incidentLog;
  @Input() map: Map;

  @Input() createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  @Input() getLogForIncident: (incidentId: number) => void;
  @Input() saveNewIncidentStatus: (incidentId: number, status: string) => void;
  @Input() createNote: (incidentId: number, note: NotesTypes.Note) => void;
  @Input() pollIncident: (incidentId: number, comment: string) => void;

  public lastKnownPositionFormatted: Readonly<{ latitude: string, longitude: string }>;
  public selectedTabIndex = 0;
  public incidentStatusLog: IncidentTypes.incidentLog;
  public incidentManualPositionLog: IncidentTypes.incidentLog;

  ngOnChanges() {
    this.lastKnownPositionFormatted = convertDDToDDM(
      this.incident.lastKnownLocation.location.latitude,
      this.incident.lastKnownLocation.location.longitude
    );
    if(typeof this.incidentLog !== 'undefined') {
      this.incidentStatusLog = {
        log: Object.values(this.incidentLog.log).reduce((incidentStatusLog, logEntry) => {
          if(logEntry.eventType === 'INCIDENT_STATUS') {
            incidentStatusLog = { ...incidentStatusLog, [logEntry.id]: logEntry };
          }
          return incidentStatusLog;
        }, {}),
        relatedObjects: { notes: {}, polls: {}, positions: {} }
      };
      this.incidentManualPositionLog = {
        log: Object.values(this.incidentLog.log).reduce((incidentStatusLog, logEntry) => {
          if(logEntry.eventType === 'MANUAL_POSITION') {
            incidentStatusLog = { ...incidentStatusLog, [logEntry.id]: logEntry };
          }
          return incidentStatusLog;
        }, {}),
        relatedObjects: { notes: {}, polls: {}, positions: this.incidentLog.relatedObjects.positions }
      };
    }
  }

  public createManualMovementCurried = (movement: AssetTypes.Movement) => {
    return this.createManualMovement({
      movement,
      asset: {
        cfr: this.asset.asset.cfr,
        ircs: this.asset.asset.ircs
      }
    });
  }

  public changeStatus = (status: string) => {
    return this.saveNewIncidentStatus(this.incident.id, status);
  }

  public createNoteWithId = (note: NotesTypes.Note) => {
    return this.createNote(this.incident.id, { ...note, assetId: this.asset.asset.id });
  }

  formatDate(dateTime) {
    return formatUnixtimeWithDot(dateTime);
  }

  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
  }

  changeTab(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
    if(tabIndex !== 0) {
      this.getLogForIncident(this.incident.id);
    }
  }
}
