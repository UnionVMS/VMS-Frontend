export type FishingReport = Readonly<{
  clientCreatedAt: number;
  clientUpdatedAt: number;
  serverCreatedAt: number;
  serverUpdatedAt: number;
  id: string;
  shipCfr: string;
  targetSpeciesCode: string;
  priorNotificationId: string;
  fishingCatchIds: ReadonlyArray<string>;
  status: string;
}>;

export type PriorNotification = Readonly<{
  arrivalLocation_portCode: string;
  arrivalLocation_userSpecifiedLocationId: string|null;
  clientCreatedAt: number;
  clientUpdatedAt: number;
  estimatedLandingTime: number;
  id: string
  priorNotificationEstimatedCatchIds: ReadonlyArray<string>;
  serverCreatedAt: number;
  serverUpdatedAt: number;
}>;

export type FishingReports = Readonly<{ [fishingReportId: string]: FishingReport }>;
export type PriorNotifications = Readonly<{ [priorNotificationId: string]: PriorNotification }>;

export type State = Readonly<{
  fishingReports: FishingReports;
  priorNotifications: PriorNotifications;
  fishingReportSearches: Readonly<{ [searchId: string]: ReadonlyArray<string> }>;
  currentFishingReportSearch: string;
  lastUserSearchForFishingReport: string;
}>;
