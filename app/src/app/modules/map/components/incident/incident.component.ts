import { Component, Input, OnChanges } from '@angular/core';
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
  styleUrls: ['./incident.component.scss']
})
export class IncidentComponent implements OnChanges {
  @Input() asset: AssetTypes.AssetData;
  @Input() incident: IncidentTypes.assetNotSendingIncident;
  @Input() map: Map;

  @Input() createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  @Input() saveNewIncidentStatus: (incidentId: number, status: string) => void;
  @Input() createNote: (note: NotesTypes.Note) => void;

  public lastKnownPositionFormatted: Readonly<{ latitude: string, longitude: string }>;

  ngOnChanges() {
    this.lastKnownPositionFormatted = convertDDToDDM(
      this.incident.lastKnownLocation.location.latitude,
      this.incident.lastKnownLocation.location.longitude
    );
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
    return this.createNote({ ...note, assetId: this.asset.asset.id });
  }

  formatDate(dateTime) {
    return formatUnixtimeWithDot(dateTime);
  }

  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
  }
}
