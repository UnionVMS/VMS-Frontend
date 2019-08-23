import { Action } from '@ngrx/store';
import { ActionTypes } from './track-panel.actions';
import * as Interfaces from './track-panel.interfaces';

export const initialState: Interfaces.State = {
  trackPanelColumns: [
    { id: 1, columnName: 'Id' },
    { id: 2, columnName: 'Lat' },
    { id: 3, columnName: 'Long' },
    { id: 4, columnName: 'Heading' },
    { id: 5, columnName: 'Speed' },
    { id: 6, columnName: 'Time' },
    { id: 7, columnName: 'Source' }
  ],
  selectedTrackPanelColumns: [1, 2, 3, 4, 5, 6]
};



export function trackPanel(state = initialState, { type, payload }) {
  switch (type) {

    case ActionTypes.ClearTrackPanelColumn:
      return {
        ...state,
        selectedTrackPanelColumns: state.selectedTrackPanelColumns.filter((id) => id !== payload)
      };

    case ActionTypes.SetTrackPanelColumn: {
      // tslint:disable:no-shadowed-variable
      let newState = { ...state };
      // tslint:enable:no-shadowed-variable
      if (!state.selectedTrackPanelColumns.includes(payload)) {
        console.warn('Check - New state track: ', newState);
        console.warn('Check - Payload: ', payload);
        newState = { ...state, selectedTrackPanelColumns: [ ...state.selectedTrackPanelColumns, payload ]};
      }
      console.warn('New state track: ', newState);
      return newState;
    }


    default:
      return state;
  }
}
