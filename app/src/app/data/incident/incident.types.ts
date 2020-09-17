import { FullMovement } from '@data/asset/asset.types';

export enum IncidentNotificationTypes {
  created,
  updated,
  done
}

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
  RESOLVED = 'RESOLVED'
}

export enum ParkedStatuses {
  PARKED = 'PARKED',
  RECEIVING_AIS_POSITIONS = 'RECEIVING_AIS_POSITIONS',
  RESOLVED = 'RESOLVED'
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
  ownershipTransfer = 'OWNER_TRANSFER',
  parked = 'PARKED',
  manualPositionMode = 'MANUAL_MODE',
}

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
