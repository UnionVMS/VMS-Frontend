import { Position } from '../generic.interfaces';

export interface Viewport {
  zoom: number;
  center: Array<number>;
}

export interface State {
  flagsVisible: boolean;
  tracksVisible: boolean;
  namesVisible: boolean;
  speedsVisible: boolean;
  forecastsVisible: boolean;
  forecastInterval: number|null;
  tracksMinuteCap: number|null;
  viewports: { [key: number]: Viewport };
  startZoomLevel: number;
  startPosition: Position;
  assetColorMethod: string;
}
