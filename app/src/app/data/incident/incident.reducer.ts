import { Action, createReducer, on } from '@ngrx/store';
import * as IncidentActions from './incident.actions';
import * as Interfaces from './incident.interfaces';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Interfaces.State = {
  assetNotSendingIncidents: {},
};

export const incidentReducer = createReducer(initialState,
  on(IncidentActions.setAssetNotSendingIncidents, (state, { assetNotSendingIncidents }) => ({
    ...state,
    assetNotSendingIncidents
  })),
  on(IncidentActions.updateAssetNotSendingIncidents, (state, { assetNotSendingIncidents }) => ({
    ...state,
    assetNotSendingIncidents: {
      ...state.assetNotSendingIncidents,
      ...assetNotSendingIncidents
    }
  }))
);
