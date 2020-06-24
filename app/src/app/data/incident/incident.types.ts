import { Movement } from '@data/asset/asset.types';

export enum incidentNotificationTypes {
  created,
  updated,
  done
}

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
}>;

export type IncidentsCollectionByType = Readonly<{
  unresolvedIncidents: ReadonlyArray<Incident>;
  recentlyResolvedIncidents: ReadonlyArray<Incident>;
}>;

export type IncidentIdsCollectionByType = Readonly<{
  unresolvedIncidentIds: ReadonlyArray<number>;
  recentlyResolvedIncidentIds: ReadonlyArray<number>;
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
  assetNotSendingIncidents: IncidentIdsCollectionByType;
  incidentNotificationsByType: {
    readonly [type: string]: IncidentNotificationsCollections;
  };
  incidentLogs: IncidentLogs;
}>;
