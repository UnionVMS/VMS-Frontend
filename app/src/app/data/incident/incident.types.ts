import { FullMovement } from '@data/asset/asset.types';

export enum IncidentNotificationTypes {
  created,
  updated,
  done
}

export const IncidentResolvedStatus = 'RESOLVED';

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
  lastKnownLocation: FullMovement;
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

export type IncidentLogEntry = Readonly<{
  id: number,
  eventType: string,
  createDate: number,
  incidentId: number,
  message: string,
  relatedObjectId: string
}>;

export type PollLogEntry = Readonly<{
  guid: string;
  history: ReadonlyArray<{ status: string, timestamp: number }>;
  identifier: string;
  typeRef: Readonly<{ refGuid: string, type: string }>;
}>;

export type IncidentLog = Readonly<{
  log: { readonly [logEntryId: number]: IncidentLogEntry }
  relatedObjects: {
    notes: { readonly [noteLogId: string]: any },
    polls: { readonly [pollLogId: string]: PollLogEntry },
    positions: { readonly [positionLogId: string]: FullMovement }
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
