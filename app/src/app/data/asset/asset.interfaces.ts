import { Position } from '../generic.interfaces';

export type Movement = Readonly<{
  location: Position;
  heading: number;
  guid: string;
  timestamp: string;
  speed: number | null;
  source: string;
}>;

export type UnitTonnage = Readonly<{
  name: string;
  code: string;
}>;

export type AssetMovement = Readonly<{
  microMove: Movement;
  asset: string;
  decayPercentage: number|undefined;
}>;

export type AssetList = Readonly<{
  resultPages: { readonly [page: number]: ReadonlyArray<string> };
  totalNumberOfPages: number;
  pageSize: number;
}>;

export type AssetData = Readonly<{
  asset: Asset;
  assetTracks: AssetTrack;
  currentPosition: AssetMovement;
  currentlyShowing: boolean;
}>;

export type Asset = Readonly<{
  id: string;
  historyId: string;
  ircsIndicator: any;
  ersIndicator: any;
  aisIndicator: any;
  vmsIndicator: any;
  hullMaterial: any;
  commissionDate: any;
  constructionYear: any;
  constructionPlace: any;
  updateTime: string;
  source: string;
  vesselType: string;
  vesselDateOfEntry: any;
  cfr: any;
  imo: any;
  ircs: string;
  mmsi: string;
  iccat: any;
  uvi: any;
  gfcm: any;
  active: boolean;
  flagStateCode: string;
  eventCode: any;
  name: string;
  externalMarking: any;
  agentIsAlsoOwner: any;
  lengthOverAll: any;
  lengthBetweenPerpendiculars: any;
  safteyGrossTonnage: any;
  otherTonnage: any;
  grossTonnage: any;
  grossTonnageUnit: string;
  portOfRegistration: string;
  powerOfAuxEngine: any;
  powerOfMainEngine: any;
  hasLicence: any;
  licenceType: any;
  mainFishingGearCode: any;
  subFishingGearCode: any;
  gearFishingType: any;
  mobileTerminalIds: ReadonlyArray<string>;
  ownerName: any;
  hasVms: any;
  ownerAddress: any;
  assetAgentAddress: any;
  countryOfImportOrExport: any;
  typeOfExport: any;
  administrativeDecisionDate: any;
  segment: any;
  segmentOfAdministrativeDecision: any;
  publicAid: any;
  registrationNumber: any;
  updatedBy: string;
  prodOrgCode: any;
  prodOrgName: any;
}>;

export type LineSegment = Readonly<{
  speed: number;
  positions: ReadonlyArray<Position>;
  color: string;
}>;

export type AssetTrack = Readonly<{
  tracks: ReadonlyArray<Movement>;
  assetId: string;
  lineSegments: ReadonlyArray<LineSegment>;
}>;

export type AssetFilterQuery = Readonly<{
  type: string;
  values: ReadonlyArray<any>;
  inverse: boolean;
  isNumber: boolean;
}>;

export type CurrentAssetList = Readonly<{
  listIdentifier: string;
  currentPage: number;
}>;

export type AssetEssentialProperties = Readonly<{
  assetId: string;
  flagstate: string;
  assetName: string;
  vesselType: string;
  ircs: string;
  cfr: string;
  externalMarking: string;
  lengthOverAll: number;
}>;

export type AssetMovementWithEssentials = Readonly<{
  assetEssentials: AssetEssentialProperties;
  assetMovement: AssetMovement;
}>;

export type AssetGroupField = Readonly<{
  id: string;
  key: string;
  updateTime: string;
  updatedBy: string;
  value: string;
}>;

export type AssetGroup = Readonly<{
  id: string;
  archived: boolean;
  dynamic: boolean;
  global: boolean;
  name: string;
  owner: string;
  updateTime: string;
  updatedBy: string;
  assetGroupFields: ReadonlyArray<AssetGroupField>;
}>;

export type assetNotSendingIncident = Readonly<{
  id: number,
  assetId: string,
  assetName: string,
  assetIrcs: string,
  lastKnownLocation: Movement,
  status: string,
}>;

export type AssetTrips = Readonly<{
  [dateTime: string]: { readonly [assetId: string]: AssetMovement }
}>;

export type State = Readonly<{
  assetGroups: ReadonlyArray<AssetGroup>;
  selectedAssetGroups: ReadonlyArray<AssetGroup>;
  selectedAssets: ReadonlyArray<string>;
  selectedAsset: string|null;
  assetTrips: AssetTrips;
  assetTripGranularity: number;
  assetTripTimestamp: number;
  assets: { readonly [uid: string]: Asset };
  assetsEssentials: { readonly [uid: string]: AssetEssentialProperties };
  assetLists: { readonly [identifier: string]: AssetList };
  assetNotSendingIncidents: { readonly [assetId: string]: assetNotSendingIncident };
  currentAssetList: CurrentAssetList;
  assetMovements: { readonly [assetId: string]: AssetMovement };
  assetTracks: { readonly [assetId: string]: AssetTrack };
  forecasts: ReadonlyArray<string>;
  positionsForInspection: { readonly [id: number]: Movement };
  searchQuery: string;
  filterQuery: ReadonlyArray<AssetFilterQuery>;
  unitTonnages: ReadonlyArray<UnitTonnage>;
}>;
