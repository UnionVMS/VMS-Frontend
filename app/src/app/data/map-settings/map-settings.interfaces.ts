import { Position } from '../generic.interfaces';

export type MapLocation = Readonly<{
  zoom: number;
  center: ReadonlyArray<number>;
}>;

export type Settings = Readonly<{
  flagsVisible: boolean;
  tracksVisible: boolean;
  namesVisible: boolean;
  speedsVisible: boolean;
  forecastsVisible: boolean;
  forecastInterval: number|null;
  tracksMinuteCap: number|null;
  startZoomLevel: number;
  startPosition: Position;
  assetColorMethod: string;
}>;

export type State = Readonly<{
  settings: Settings;
  mapLocations: { readonly [key: number]: MapLocation };
  currentControlPanel: string|null;
}>;
