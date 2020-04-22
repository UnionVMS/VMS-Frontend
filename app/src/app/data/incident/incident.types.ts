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

export type State = Readonly<{
  assetNotSendingIncidents: { readonly [assetId: string]: assetNotSendingIncident };
  incidentNotificationsByType: {
    readonly [type: string]: incidentNotificationsCollections;
  }
}>;
