import { Position } from '../generic.interfaces';

export interface Movement {
  location: Position;
  heading: number;
  guid: string;
  timestamp: string;
  speed: number | null;
  source: string;
}

export interface AssetMovement {
  microMove: Movement;
  asset: string;
  decayPercentage: number|undefined;
}

export interface AssetList {
  resultPages: { [page: number]: Array<string> };
  totalNumberOfPages: number;
  pageSize: number;
}

export interface AssetData {
  asset: Asset;
  assetTracks: AssetTrack;
  currentPosition: AssetMovement;
  currentlyShowing: boolean;
}

export interface Asset {
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
}

export interface LineSegment {
  speed: number;
  positions: Array<Position>;
  color: string;
}

export interface AssetTrack {
  tracks: Array<Movement>;
  visible: boolean;
  assetId: string;
  lineSegments: Array<LineSegment>;
}

export interface AssetFilterQuery {
  type: string;
  values: Array<any>;
  inverse: boolean;
  isNumber: boolean;
}

export interface CurrentAssetList {
  listIdentifier: string;
  currentPage: number;
}

export interface AssetEssentialProperties {
  assetId: string;
  flagstate: string;
  assetName: string;
  vesselType: string;
  ircs: string;
  cfr: string;
  externalMarking: string;
  lengthOverAll: number;
}

export interface AssetMovementWithEssentials {
  assetEssentials: AssetEssentialProperties;
  assetMovement: AssetMovement;
}

export interface AssetGroupField {
  id: string;
  key: string;
  updateTime: string;
  updatedBy: string;
  value: string;
}

export interface AssetGroup {
  id: string;
  archived: boolean;
  dynamic: boolean;
  global: boolean;
  name: string;
  owner: string;
  updateTime: string;
  updatedBy: string;
  assetGroupFields: Array<AssetGroupField>;
}

export interface State {
  assetGroups: Array<AssetGroup>;
  selectedAssetGroups: Array<AssetGroup>;
  selectedAssets: Array<string>;
  selectedAsset: string|null;
  assets: { [uid: string]: Asset };
  assetsEssentials: { [uid: string]: AssetEssentialProperties };
  assetLists: { [identifier: string]: AssetList };
  currentAssetList: CurrentAssetList;
  assetMovements: { [uid: string]: AssetMovement };
  assetTracks: { [assetId: string]: AssetTrack };
  forecasts: Array<string>;
  positionsForInspection: { [id: number]: Movement };
  searchQuery: string;
  filterQuery: Array<AssetFilterQuery>;
}
