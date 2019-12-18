import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '@app/app-reducer';


export const selectAssetNotSendingIncidents = (state: State) => state.incident.assetNotSendingIncidents;

export const getAssetNotSendingIncidents = createSelector(
  selectAssetNotSendingIncidents,
  (assetNotSendingIncidents) => {
    return Object.values(assetNotSendingIncidents);
  }
);

export const getAssetNotSendingIncidentsByAssetId = createSelector(
  selectAssetNotSendingIncidents,
  (assetNotSendingIncidents) => assetNotSendingIncidents
);
