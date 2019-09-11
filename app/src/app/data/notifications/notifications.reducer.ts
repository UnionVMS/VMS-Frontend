import { createReducer, on } from '@ngrx/store';
import * as NotificationsActions from './notifications.actions';
import * as Interfaces from './notifications.interfaces';

export const initialState: Interfaces.State = {
  errors: [],
  notices: [],
  success: [],
};

export const mapSettingsReducer = createReducer(initialState,
  on(NotificationsActions.addNotification, (state, { notificationType, notification }) => {
    console.warn('-------------------', notification);
    return ({
      ...state,
      [notificationType]: [ ...state[notificationType], notification ]
    });
  }),
);
