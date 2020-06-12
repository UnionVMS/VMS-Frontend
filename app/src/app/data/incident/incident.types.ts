import { Movement } from '@data/asset/asset.types';

export enum incidentNotificationTypes {
  created,
  updated,
  done
}

export type assetNotSendingIncident = Readonly<{
  id: number,
  assetId: string,
  assetName: string,
  assetIrcs: string,
  lastKnownLocation: Movement,
  status: string,
}>;

export type incidentNotifications = Readonly<{
  created: number;
  updated: number;
}>;

export type incidentNotificationsCollections = Readonly<{
  readonly [incidentId: number]: incidentNotifications;
}>;

export type incidentLogEntry = Readonly<{
  id: number,
  eventType: string,
  createDate: number,
  incidentId: number,
  message: string,
  relatedObjectId: string
}>;

export type pollLogEntry = Readonly<{
  guid: string;
  history: ReadonlyArray<{ status: string, timestamp: number }>;
  identifier: string;
  typeRef: Readonly<{ refGuid: string, type: string }>;
}>;

export type incidentLog = Readonly<{
  log: { readonly [logEntryId: number]: incidentLogEntry }
  relatedObjects: {
    notes: { readonly [noteLogId: string]: any },
    polls: { readonly [pollLogId: string]: pollLogEntry },
    positions: { readonly [positionLogId: string]: Movement }
  }
}>;

export type incidentLogs = Readonly<{
  readonly [incidentId: number]: incidentLog;
}>;


export type State = Readonly<{
  assetNotSendingIncidents: { readonly [assetId: string]: assetNotSendingIncident };
  incidentNotificationsByType: {
    readonly [type: string]: incidentNotificationsCollections;
  },
  incidentLogs: incidentLogs;
}>;
