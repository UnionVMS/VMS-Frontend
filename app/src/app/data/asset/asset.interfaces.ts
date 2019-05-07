export interface Position {
  longitude: number;
  latitude: number;
}

export interface Movement {
  location: Position;
  heading: number;
  guid: string;
  timestamp: string;
  speed: number;
}

export interface AssetMovement {
  microMove: Movement;
  asset: string;
  flagstate: string;
  assetName: string;
}

export interface FullAsset {
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

export interface State {
  selectedAsset: string|null;
  fullAssets: { [uid: string]: FullAsset };
  assets: { [uid: string]: AssetMovement };
  assetTracks: { [assetId: string]: AssetTrack };
  forecasts: Array<string>;
  positionsForInspection: any;
  searchQuery: string;
  filterQuery: string;
}
