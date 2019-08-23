import { Position } from '../generic.interfaces';

export interface TrackPanelColumn {
  id: number;
  columnName: string;
}

export interface State {
  trackPanelColumns: Array<TrackPanelColumn>;
  selectedTrackPanelColumns: Array<number>;
}
