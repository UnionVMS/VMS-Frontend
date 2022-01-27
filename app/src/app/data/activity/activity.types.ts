export type Activity = Readonly<{
  vesselId: string;
  activityType: string;
  FAReportType: string;
  occurence: number;
  startDate: number;
  latitude: number;
  longitude: number;
  areas: ReadonlyArray<string>;
  port: ReadonlyArray<string>;
  relatedActivities: ReadonlyArray<ActivityPart>;
  fishingGears: ReadonlyArray<FishingGear>;
  species: ReadonlyArray<Species>;
}>;

export type ActivityPart = Readonly<{
  activityType: string;
  occurence: string;
  latitude: number;
  longitude: number;
}>;

export type FishingGear = Readonly<{
  gearRoleCode: string;
  gearTypeCode: string;
  gearMeasure?: string;
  gearQuantity?: string;
  meshSize?: string;
  nominalLength?: string;
}>;

export type Species = Readonly<{
  code: string;
  typeCode: string;
  weight: number;
  weightMeans: string;
  sizeClass: string;
  presentation: string;
  preservation: string;
  longitude: number;
  latitude: number;
  areas: ReadonlyArray<string>;
}>;

export type State = Readonly<{
  assetActivities: Readonly<{ readonly [assetId: string]: Activity }>;
}>;
