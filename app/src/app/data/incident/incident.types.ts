import { Movement, PollStatusObject } from '@data/asset/asset.types';

export enum IncidentNotificationTypes {
  created,
  updated,
  done
}

export const IncidentResolvedStatus = 'RESOLVED';

export const StatusTranslations = {
  POLL_FAILED: $localize`:@@ts-issue-status-poll-failed:Poll Failed`,
  ATTEMPTED_CONTACT: $localize`:@@ts-issue-status-attempted-contact:Attempted Contact`,
  MANUAL_POSITION_MODE: $localize`:@@ts-issue-status-manual-position-mode:Manual Position Mode`,
  PARKED: $localize`:@@ts-issue-status-parked:Parked`,
  TECHNICAL_ISSUE: $localize`:@@ts-issue-status-technical-issue:Technical issue`,
  RESOLVED: $localize`:@@ts-issue-status-resolved:Resolved`,
  INCIDENT_CREATED: $localize`:@@ts-issue-status-created:Created`,
  MANUAL_POSITION_LATE: $localize`:@@ts-issue-status-manual-position-late:Overdue`,
  RECEIVING_VMS_POSITIONS: $localize`:@@ts-issue-status-recieving-vms-positioins:Recieving VMS`,
  NOT_RECEIVING_VMS_POSITIONS: $localize`:@@ts-issue-status-not-recieving-vms-positioins:Not recieving VMS`,
  OVERDUE: $localize`:@@ts-issue-status-overdue:Overdue`,
  RECEIVING_AIS_POSITIONS: $localize`:@@ts-issue-status-recieving-ais-positioins:Recieving AIS`,
};

export enum AssetNotSendingStatuses {
  INCIDENT_CREATED = 'INCIDENT_CREATED',
  ATTEMPTED_CONTACT = 'ATTEMPTED_CONTACT',
  RESOLVED = 'RESOLVED'
}

export enum ManualPositionModeStatuses {
  MANUAL_POSITION_MODE = 'MANUAL_POSITION_MODE',
  MANUAL_POSITION_LATE = 'MANUAL_POSITION_LATE',
  RECEIVING_VMS_POSITIONS = 'RECEIVING_VMS_POSITIONS',
  RESOLVED = 'RESOLVED'
}

export enum SeasonalFishingStatuses {
  PARKED = 'PARKED',
  RECEIVING_AIS_POSITIONS = 'RECEIVING_AIS_POSITIONS',
  OVERDUE = 'OVERDUE',
  RESOLVED = 'RESOLVED'
}

export enum ParkedStatuses {
  PARKED = 'PARKED',
  RECEIVING_AIS_POSITIONS = 'RECEIVING_AIS_POSITIONS',
  OVERDUE = 'OVERDUE',
  RESOLVED = 'RESOLVED'
}

export enum OwnershipTransferStatuses {
  NOT_RECEIVING_VMS_POSITIONS = 'NOT_RECEIVING_VMS_POSITIONS',
  RECEIVING_VMS_POSITIONS = 'RECEIVING_VMS_POSITIONS',
  RESOLVED = 'RESOLVED',
}

export enum IncidentRisk {
  none = 'NONE',
  low = 'LOW',
  medium = 'MEDIUM',
  high = 'HIGH',
}

export enum IncidentTypes {
  assetNotSending = 'ASSET_NOT_SENDING',
  seasonalFishing = 'SEASONAL_FISHING',
  ownershipTransfer = 'OWNERSHIP_TRANSFER',
  parked = 'PARKED',
  manualPositionMode = 'MANUAL_POSITION_MODE',
}

export const IncidentTypesTranslations = {
  ASSET_NOT_SENDING: $localize`:@@ts-issue-type-asset-not-sending:Asset not sending`,
  SEASONAL_FISHING: $localize`:@@ts-issue-type-seasonal-fishing:Seasonal fishing`,
  OWNERSHIP_TRANSFER: $localize`:@@ts-issue-type-ownership-transfer:Ownership transfer`,
  LONG_TERM_PARKED: $localize`:@@ts-issue-type-long-term-parked:Long term parked`,
  PARKED: $localize`:@@ts-issue-type-parked:Parked`,
  MANUAL_POSITION_MODE: $localize`:@@ts-issue-type-manual-position-mode:Manual position mode`
};

export const IncidentTypesInverted = Object.entries(IncidentTypes).reduce((acc, [a, b]) => ({ ...acc, [b]: a }), {});
export const IncidentTypesValues = Object.values(IncidentTypes).map((incidentType) => incidentType.toString());

export type IncidentTypesCollection = ReadonlyArray<IncidentTypes>;

export type Incident = Readonly<{
  id: number;
  assetId: string;
  assetIrcs: string;
  assetName: string;
  createDate: number;
  lastKnownLocation: Movement;
  status: string,
  ticketId: string;
  updateDate: number;
  type: IncidentTypes;
  risk?: IncidentRisk;
  expiryDate?: number;
}>;

export type IncidentsCollectionByResolution = Readonly<{
  unresolvedIncidents: ReadonlyArray<Incident>;
  recentlyResolvedIncidents: ReadonlyArray<Incident>;
}>;

export type IncidentsByTypeAndStatus = Readonly<{
  readonly [typeName: string]: IncidentsCollectionByResolution
}>;

export type IncidentIdsCollectionByType = Readonly<{
  unresolvedIncidentIds: ReadonlyArray<number>;
  recentlyResolvedIncidentIds: ReadonlyArray<number>;
}>;

export type IncidentIdsByTypeAndStatus = Readonly<{
  assetNotSending: IncidentIdsCollectionByType,
  manualPositionMode: IncidentIdsCollectionByType,
  seasonalFishing: IncidentIdsCollectionByType,
  parked: IncidentIdsCollectionByType,
  ownershipTransfer: IncidentIdsCollectionByType,
}>;

export type IncidentNotifications = Readonly<{
  created: number;
  updated: number;
}>;

export type IncidentNotificationsCollections = Readonly<{
  readonly [incidentId: number]: IncidentNotifications;
}>;

export enum LogEntryType {
  MANUAL_POSITION = 'MANUAL_POSITION',
  MANUAL_POSITION_LATE = 'MANUAL_POSITION_LATE',
  RECEIVED_AIS_POSITION = 'RECEIVED_AIS_POSITION',
  RECEIVED_VMS_POSITION = 'RECEIVED_VMS_POSITION',
  POLL_CREATED = 'POLL_CREATED',
  AUTO_POLL_CREATED = 'AUTO_POLL_CREATED',
  AUTO_POLL_CREATION_FAILED = 'AUTO_POLL_CREATION_FAILED',
  NOTE_CREATED = 'NOTE_CREATED',
  INCIDENT_CREATED = 'INCIDENT_CREATED',
  EXPIRY_UPDATED = 'EXPIRY_UPDATED',
  INCIDENT_CLOSED = 'INCIDENT_CLOSED',
  INCIDENT_STATUS = 'INCIDENT_STATUS',
  INCIDENT_TYPE = 'INCIDENT_TYPE',
}

export type IncidentLogEntry = Readonly<{
  id: number,
  data?: {
    user?: string,
    expiry?: number,
    from?: string,
    to?: string,
    errorMessage?: string,
  };
  eventType: LogEntryType,
  createDate: number,
  incidentId: number,
  message: string,
  relatedObjectId: string
}>;

export type IncidentLog = Readonly<{
  log: { readonly [logEntryId: number]: IncidentLogEntry }
  relatedObjects: {
    notes: { readonly [noteLogId: string]: any },
    polls: { readonly [pollLogId: string]: PollStatusObject },
    positions: { readonly [positionLogId: string]: Movement }
  }
}>;

export type IncidentLogs = Readonly<{
  readonly [incidentId: number]: IncidentLog;
}>;

export type State = Readonly<{
  selectedIncidentId: number;
  incidents: {
    readonly [incidentId: number]: Incident
  };
  incidentsForAssets: {
    readonly [assetId: string]: ReadonlyArray<number>
  };
  incidentsByTypesAndStatus: IncidentIdsByTypeAndStatus;
  incidentLogs: IncidentLogs;
  incidentTypes: IncidentTypesCollection
}>;
