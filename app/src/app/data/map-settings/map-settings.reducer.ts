import { Action } from '@ngrx/store';
import { ActionTypes } from './map-settings.actions';

export interface State {
  namesVisible: boolean;
  speedsVisible: boolean;
}

const initialState: State = {
  namesVisible: true,
  speedsVisible: true,
};

export function mapSettingsReducer(state = initialState, action: Action) {
  switch (action.type) {
    case ActionTypes.SetVisibilityForAssetNames:
      return { ...state, namesVisible: action.payload };
    case ActionTypes.SetVisibilityForAssetSpeeds:
      return { ...state, speedsVisible: action.payload };
    default:
      return state;
  }
}
