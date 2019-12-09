import { Component, Input } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { NotesInterfaces } from '@data/notes';
import { Position } from '@data/generic.interfaces';


@Component({
  selector: 'map-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss']
})
export class IncidentComponent {
  @Input() asset: AssetInterfaces.AssetData;
  @Input() incident: AssetInterfaces.assetNotSendingIncident;

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

  public formatDate(date) {
    return formatDate(date);
  }

  getCountryCode(asset) {
    return getContryISO2(asset.asset.flagStateCode).toLowerCase();
  }
}
