import { createReducer, on } from '@ngrx/store';
import * as UserSettingsActions from './user-settings.actions';
import * as Types from './user-settings.types';

export const initialState: Types.State = {
  timezone: 'Etc/UTC'
};

export const userSettingsReducer = createReducer(initialState,
  on(UserSettingsActions.setTimezone, (state, { timezone }) => ({
    ...state,
    timezone
  })),
);
