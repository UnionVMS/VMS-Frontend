import { Movement } from '@data/asset/asset.interfaces';

export type assetNotSendingIncident = Readonly<{
  id: number,
  assetId: string,
  assetName: string,
  assetIrcs: string,
  lastKnownLocation: Movement,
  status: string,
}>;

export type State = Readonly<{
  assetNotSendingIncidents: { readonly [assetId: string]: assetNotSendingIncident };
}>;
