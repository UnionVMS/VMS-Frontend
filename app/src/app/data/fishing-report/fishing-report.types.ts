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
}>;

export type FishingReports = Readonly<{ [fishingReportId: string]: FishingReport }>;

export type State = Readonly<{
  fishingReports: FishingReports;
}>;
