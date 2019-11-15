import { Position } from '../generic.interfaces';

export type Viewport = Readonly<{
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
  viewports: { readonly [key: number]: Viewport };
  currentControlPanel: string|null;
}>;
