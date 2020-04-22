export type Realtime = Readonly<{
  ready: boolean;
}>;

export type Report = Readonly<{
  searching: boolean;
}>;

export type State = Readonly<{
  mapSettingsLoaded: boolean;
  realtime: Realtime;
  report: Report;
  filtersActive: { readonly [filterTypeName: string]: boolean }
  activeLeftPanel: string;
  activeRightPanel: string;
}>;
