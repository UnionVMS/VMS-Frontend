import { Position, TimePosition } from '../generic.types';

export const OceanRegionTranslation = {
  AORE: 'East Atlantic',
  AORW: 'West Atlantic',
  POR: 'Pacific',
  IOR: 'Indian'
};

export type Movement = Readonly<{
  location: Position;
  heading: number;
  id: string;
  timestamp: number;
  speed: number | null;
  source: string;
  sourceSatelliteId?: number;
}>;

export type FullMovement = Readonly<{
  location: Position;
  heading: number;
  id: string;
  timestamp: number;
  speed: number | null;
  source: string;
  sourceSatelliteId: number;

  tripNumber: number;
  internalReferenceNumber: string;
  status: string;
  movementType: string;
  lesReportTime: number;
  updated: number;
  updatedBy: string;
}>;


export type ManualMovement = Readonly<{
  movement: Movement;
  asset: Readonly<{
    cfr: string,
    ircs: string,
  }>;
}>;

export type AssetMovement = Readonly<{
  microMove: Movement;
  asset: string;
  decayPercentage: number|undefined;
}>;

export type AssetList = Readonly<{
  searchQuery: any;
  assets: ReadonlyArray<string>;
}>;

export type AssetListSearchQuery = Readonly<{
  fields: ReadonlyArray<AssetListSearchQuery|AssetListSearchQueryField>,
  logicalAnd: boolean;
}>;

export type AssetListSearchQueryField = Readonly<{
  searchField: string;
  searchValue: string|number;
  operator?: string;
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
  updateTime: number;
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
  id: string;
  speed: number;
  positions: ReadonlyArray<TimePosition>;
  color: string;
}>;

export type AssetTrack = Readonly<{
  tracks: ReadonlyArray<Movement>;
  lastAddedTracks: ReadonlyArray<Movement>;
  assetId: string;
  lineSegments: ReadonlyArray<LineSegment>;
  sources: ReadonlyArray<string>;
}>;

export type AssetFilterQuery = Readonly<{
  type: string;
  values: ReadonlyArray<any>; // ReadonlyArray<string|Readonly<{ operator?: string, value: number }>>
  inverse: boolean;
  isNumber: boolean;
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

export type AssetTrips = Readonly<{
  [dateTime: string]: { readonly [assetId: string]: AssetMovement }
}>;

export type UnitTonnage = Readonly<{
  name: string;
  code: string;
}>;

export type LastPositions = Readonly<{
  ais: Movement;
  vms: Movement;
}>;

export type LastPositionsList = Readonly<{
  readonly [assetId: string]: LastPositions
}>;

export type AssetLicence = Readonly<{
  id: string;
  assetId: string;
  civicNumber: string;
  createdDate: number;
  decisionDate: number,
  fromDate: number,
  licenceNumber: number,
  toDate: number,
  name: string;
  constraints: string;
}>;

export type AssetLicences = Readonly<{
  readonly [assetId: string]: AssetLicence
}>;

export enum PollType {
  AUTOMATIC_POLL = 'AUTOMATIC_POLL',
  PROGRAM_POLL = 'PROGRAM_POLL',
  SAMPLING_POLL = 'SAMPLING_POLL',
  MANUAL_POLL = 'MANUAL_POLL',
  CONFIGURATION_POLL = 'CONFIGURATION_POLL',
  BASE_POLL = 'BASE_POLL'
}

export enum PollStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  TIMED_OUT = 'TIMED_OUT',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
}

export type PollPostObject = Readonly<{
  comment: string,
  pollType?: PollType,
  frequency?: number,
  startDate?: number,
  endDate?: number,
}>;

export type PollHistory = Readonly<{
  status: PollStatus,
  timestamp: number
}>;

export type PollStatusObject = Readonly<{
  guid: string,
  history: ReadonlyArray<PollHistory>,
  identifier: string,
  refMessage: string,
  typeRef: {
    message: string,
    refGuid: string,
    type: string
  }
}>;

export type Poll = Readonly<{
  pollInfo: {
    assetId: string,
    channelId: string,
    comment: string,
    creator: string,
    id: string,
    mobileterminalId: string,
    pollTypeEnum: PollType,
    createTime: number,
    updatedBy: string,
    frequency?: number,
    endDate?: number,
    startDate?: number,
  },
  pollStatus: PollStatusObject,
  movement?: FullMovement
}>;

export type State = Readonly<{
  selectedAssets: ReadonlyArray<string>;
  selectedAsset: string|null;
  selectedAssetsLastPositions: LastPositionsList;
  assetTrips: AssetTrips;
  assetTripGranularity: number;
  assetTripTimestamp: number;
  assets: Readonly<{ readonly [uid: string]: Asset }>;
  assetsEssentials: Readonly<{ readonly [uid: string]: AssetEssentialProperties }>;
  assetLists: Readonly<{ readonly [identifier: string]: AssetList }>;
  currentAssetList: string;
  lastUserAssetSearch: string;
  assetMovements: Readonly<{ readonly [assetId: string]: AssetMovement }>;
  assetTracks: Readonly<{ readonly [assetId: string]: AssetTrack }>;
  lastFullPositions: Readonly<{ readonly [assetId: string]: ReadonlyArray<FullMovement> }>;
  forecasts: ReadonlyArray<string>;
  positionsForInspection: Readonly<{ readonly [id: number]: Movement }>;
  searchQuery: string;
  filterQuery: ReadonlyArray<AssetFilterQuery>;
  unitTonnages: ReadonlyArray<UnitTonnage>;
  assetLicences: AssetLicences;
  lastPollsForAsset: Readonly<{
    readonly [assetId: string]: Readonly<{
      readonly [pollId: string]: Poll
    }>
  }>
}>;
