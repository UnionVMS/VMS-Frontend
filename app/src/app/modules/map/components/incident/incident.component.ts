import { Component, Input } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import Map from 'ol/Map';

import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { IncidentInterfaces } from '@data/incident';
import { NotesInterfaces } from '@data/notes';
import { Position } from '@data/generic.interfaces';


@Component({
  selector: 'map-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss']
})
export class IncidentComponent {
  @Input() asset: AssetInterfaces.AssetData;
  @Input() incident: IncidentInterfaces.assetNotSendingIncident;
  @Input() map: Map;

  @Input() createManualMovement: (manualMovement: AssetInterfaces.ManualMovement) => void;
  @Input() saveNewIncidentStatus: (incidentId: number, status: string) => void;
  @Input() createNote: (note: NotesInterfaces.Note) => void;

  public createManualMovementCurried = (movement: AssetInterfaces.Movement) => {
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

  public createNoteWithId = (note: NotesInterfaces.Note) => {
    console.warn(this.asset);
    return this.createNote({ ...note, assetId: this.asset.asset.id });
  }

  formatDate(dateTime) {
    const date = new Date(dateTime * 1000);
    const iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2})/);
    return iso[1] + ' • ' + iso[2];
  }

  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
  }
}
