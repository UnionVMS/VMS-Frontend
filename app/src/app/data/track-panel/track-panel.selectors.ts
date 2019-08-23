import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as TrackPanelInterfaces from './track-panel.interfaces';
import { State } from '@app/app-reducer';


export const selectTrackPanelColumns = (state: State) => state.trackPanel.trackPanelColumns;
export const selectSelectedTrackPanelColumns = (state: State) => state.trackPanel.selectedTrackPanelColumns;


export const getTrackPanelColumns = createSelector(
  selectTrackPanelColumns,
  (trackPanelColumns) => trackPanelColumns
);

export const getSelectedTrackPanelColumns = createSelector(
  selectSelectedTrackPanelColumns,
  (trackPanelColumns) => trackPanelColumns
);
