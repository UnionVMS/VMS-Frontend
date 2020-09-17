import { Component, ViewEncapsulation, Input, OnChanges } from '@angular/core';

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
})
export class IncidentComponent implements OnChanges {
  @Input() asset: AssetTypes.AssetData;
  @Input() incident: IncidentTypes.Incident;
  @Input() incidentTypes: IncidentTypes.IncidentTypesCollection;
  @Input() map: Map;

  @Input() createManualMovement: (manualMovement: AssetTypes.ManualMovement) => void;
  @Input() saveIncident: (incident: IncidentTypes.Incident) => void;
  @Input() createNote: (incidentId: number, note: NotesTypes.Note) => void;
  @Input() pollIncident: (incidentId: number, comment: string) => void;
  @Input() setActiveWorkflow: (workflow: string) => void;
  @Input() setActiveRightPanel: (rightPanel: ReadonlyArray<string>) => void;


  public lastKnownPositionFormatted: Readonly<{ latitude: string, longitude: string }>;

  public currentActiveBlock: string;
  public previousType: IncidentTypes.IncidentTypes;

  public permissionMatrix = {
    setStatusAttemptedContact: {
      [IncidentTypes.IncidentTypes.assetNotSending]: {
        [IncidentTypes.AssetNotSendingStatuses.INCIDENT_CREATED]: true,
        [IncidentTypes.AssetNotSendingStatuses.ATTEMPTED_CONTACT]: true
      }
    },
    expiryDateForm: {
      [IncidentTypes.IncidentTypes.seasonalFishing]: {
        [IncidentTypes.SeasonalFishingStatuses.PARKED]: true,
        [IncidentTypes.SeasonalFishingStatuses.RECEIVING_AIS_POSITIONS]: true
      },
      [IncidentTypes.IncidentTypes.parked]: {
        [IncidentTypes.ParkedStatuses.PARKED]: true,
        [IncidentTypes.ParkedStatuses.RECEIVING_AIS_POSITIONS]: true
      }
    }
  };

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
    return this.saveIncident({ ...this.incident, status });
  }

  public changeType = (type: IncidentTypes.IncidentTypes) => {
    return this.saveIncident({ ...this.incident, type, status: null });
  }

  public changeExpiryDate = (expiryDate: number | null) => {
    return this.saveIncident({ ...this.incident, expiryDate });
  }

  public registerAttemptedContact = () => {
    return this.saveIncident({ ...this.incident, status: IncidentTypes.AssetNotSendingStatuses.ATTEMPTED_CONTACT });
  }

  public checkPermission(action: string) {
    return typeof this.permissionMatrix[action] !== 'undefined'
      && typeof this.permissionMatrix[action][this.incident.type] !== 'undefined'
      && this.permissionMatrix[action][this.incident.type][this.incident.status];
  }

  public toggleCurrentActiveBlock = (blockName: string) => () => {
    if(this.currentActiveBlock === blockName) {
      this.currentActiveBlock = '';
    } else {
      this.currentActiveBlock = blockName;
    }
  }

  formatDate(dateTime) {
    return formatUnixtimeWithDot(dateTime);
  }

  isBlockActive(blockName: string) {
    return this.currentActiveBlock === blockName;
  }
}
