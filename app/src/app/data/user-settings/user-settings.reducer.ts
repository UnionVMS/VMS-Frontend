import { createReducer, on } from '@ngrx/store';
import * as UserSettingsActions from './user-settings.actions';
import * as Interfaces from './user-settings.types';

export const initialState: Interfaces.State = {
  timezone: 'Europe/Stockholm'
};

export const userSettingsReducer = createReducer(initialState,
  on(UserSettingsActions.setTimezone, (state, { timezone }) => ({
    ...state,
    timezone
  })),
);
