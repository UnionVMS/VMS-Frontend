import { Component, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Map from 'ol/Map';
import { first } from 'rxjs/operators';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import { AssetTypes } from '@data/asset';
import { IncidentTypes } from '@data/incident';
import { NotesTypes } from '@data/notes';
import { Position } from '@data/generic.types';

import { IncidentAttemptedContactDialogComponent } from '@modules/map/components/incident/incident-attempted-contact-dialog/incident-attempted-contact-dialog.component';
import { IncidentResolveDialogComponent } from '@modules/map/components/incident/incident-resolve-dialog/incident-resolve-dialog.component';
import { IncidentTypeFormDialogComponent } from '@modules/map/components/incident/incident-type-form-dialog/incident-type-form-dialog.component';

@Component({
  selector: 'map-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
})
export class IncidentComponent implements OnChanges {
  @Input() asset: AssetTypes.AssetData;
  @Input() incident: IncidentTypes.Incident;
  @Input() incidentTypes: IncidentTypes.IncidentTypesCollection;
  @Input() map: Map;
  @Input() userTimezone: string;

  @Input() createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  @Input() updateIncidentType: (incindentId: number, incidentType: IncidentTypes.IncidentTypes, expiryDate?: number) => void;
  @Input() updateIncidentStatus: (incindentId: number, status: string, expiryDate?: number) => void;
  @Input() updateIncidentExpiry: (incindentId: number, expiryDate: number) => void;
  @Input() createNote: (incidentId: number, note: NotesTypes.NoteParameters) => void;
  @Input() pollIncident: (incidentId: number, comment: string) => void;
  @Input() setActiveWorkflow: (workflow: string) => void;
  @Input() setActiveRightPanel: (rightPanel: ReadonlyArray<string>) => void;


  public lastKnownPositionFormatted: Readonly<{ latitude: string, longitude: string }>;

  public currentActiveBlock: string;
  public previousType: IncidentTypes.IncidentTypes;

  constructor(public dialog: MatDialog) { }

  ngOnChanges() {
    if(typeof this.previousType === 'undefined') {
      this.previousType = this.incident.type;
    } else if(this.previousType !== this.incident.type) {
      setTimeout(() => {
        this.setActiveWorkflow(this.incident.type);
      }, 10);
      this.previousType = this.incident.type;
    }

    this.lastKnownPositionFormatted = convertDDToDDM(
      this.incident.lastKnownLocation.location.latitude,
      this.incident.lastKnownLocation.location.longitude
    );
  }

  public createNoteCurried = (note: string) => {
    return this.createNote(this.incident.id, { note, assetId: this.asset.asset.id });
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
    return this.updateIncidentStatus(this.incident.id, status);
  }

  public changeType = (type: IncidentTypes.IncidentTypes) => {
    return this.updateIncidentType(this.incident.id, type);
  }

  public changeExpiryDate = (expiryDate: number | null) => {
    return this.updateIncidentExpiry(this.incident.id, expiryDate);
  }

  public checkPermissionForIncidentTypeForm() {
    return this.incident.status !== IncidentTypes.IncidentResolvedStatus;
  }

  public checkPermissionForManualPoll() {
    return this.incident.status !== IncidentTypes.IncidentResolvedStatus;
  }

  public checkPermissionForCreateManualPosition() {
    return this.incident.status !== IncidentTypes.IncidentResolvedStatus;
  }

  public checkPermissionForRegisterAttemptedContact() {
    const permission = {
      [IncidentTypes.IncidentTypes.assetNotSending]: {
        [IncidentTypes.AssetNotSendingStatuses.INCIDENT_CREATED]: true,
        [IncidentTypes.AssetNotSendingStatuses.ATTEMPTED_CONTACT]: true,
      }
    };
    return typeof permission[this.incident.type] !== 'undefined'
      && permission[this.incident.type][this.incident.status] === true;
  }

  public checkPermissionForExpiryDateForm() {
    const permission = {
      [IncidentTypes.IncidentTypes.seasonalFishing]: {
        [IncidentTypes.SeasonalFishingStatuses.PARKED]: true,
        [IncidentTypes.SeasonalFishingStatuses.RECEIVING_AIS_POSITIONS]: true,
        [IncidentTypes.ParkedStatuses.OVERDUE]: true
      },
      [IncidentTypes.IncidentTypes.parked]: {
        [IncidentTypes.ParkedStatuses.PARKED]: true,
        [IncidentTypes.ParkedStatuses.RECEIVING_AIS_POSITIONS]: true,
        [IncidentTypes.ParkedStatuses.OVERDUE]: true
      }
    };
    return typeof permission[this.incident.type] !== 'undefined'
      && permission[this.incident.type][this.incident.status] === true;
  }

  public checkPermissionForResloveButton() {
    return this.incident.status !== IncidentTypes.IncidentResolvedStatus;
  }

  public toggleCurrentActiveBlock = (blockName: string) => () => {
    if(this.currentActiveBlock === blockName) {
      this.currentActiveBlock = '';
    } else {
      this.currentActiveBlock = blockName;
    }
  }

  openIncidentTypeFormDialog() {
    const dialogRef = this.dialog.open(IncidentTypeFormDialogComponent, {
      data: { type: this.incident.type, types: this.incidentTypes, incident: this.incident }
    });

    dialogRef.afterClosed().pipe(first()).subscribe(detachResult => {
      if(typeof detachResult !== 'undefined' && detachResult !== false) {
        this.changeType(detachResult.type);
        this.createNoteCurried(detachResult.note);
      }
    });
  }

  openIncidentAttemptedContactDialog() {
    const dialogRef = this.dialog.open(IncidentAttemptedContactDialogComponent, {
      data: { incident: this.incident }
    });

    dialogRef.afterClosed().pipe(first()).subscribe(detachResult => {
      if(typeof detachResult !== 'undefined' && detachResult !== false) {
        this.changeStatus(IncidentTypes.AssetNotSendingStatuses.ATTEMPTED_CONTACT);
        this.createNoteCurried(detachResult.note);
      }
    });
  }

  openIncidentResolveDialog() {
    const dialogRef = this.dialog.open(IncidentResolveDialogComponent, {
      data: { incident: this.incident }
    });

    dialogRef.afterClosed().pipe(first()).subscribe(detachResult => {
      if(typeof detachResult !== 'undefined' && detachResult !== false) {
        this.changeStatus(IncidentTypes.IncidentResolvedStatus);
        this.createNoteCurried(detachResult.note);
      }
    });
  }

  isBlockActive(blockName: string) {
    return this.currentActiveBlock === blockName;
  }
}
