import { createReducer, on } from '@ngrx/store';
import * as NotificationsActions from './notifications.actions';
import * as Types from './notifications.types';

export const initialState: Types.State = {
  errors: [],
  notices: [],
  success: [],
};

export const notificationsReducer = createReducer(initialState,
  on(NotificationsActions.addNotification, (state, { notificationType, notification }) => {
    return ({
      ...state,
      [notificationType]: [ ...state[notificationType], notification ]
    });
  }),
  on(NotificationsActions.dismiss, (state, { notificationType, index }) => {
    return ({
      ...state,
      [notificationType]: state[notificationType].filter((notification: string, currentIndex: number) => currentIndex !== index)
    });
  }),
);
