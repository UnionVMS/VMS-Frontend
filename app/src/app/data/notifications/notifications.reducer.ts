import { createReducer, on } from '@ngrx/store';
import * as NotificationsActions from './notifications.actions';
import * as Types from './notifications.types';

export const initialState: Types.State = {
  errors: [],
  notices: [],
  success: [],
};

export const notificationsReducer = createReducer(initialState,
  on(NotificationsActions.addNotification, (state, { notificationType, notification, autoDismissInMs, id }) => {
    return ({
      ...state,
      [notificationType]: [ ...state[notificationType], { notification, autoDismissInMs, id } ]
    });
  }),
  on(NotificationsActions.dismiss, (state, { notificationType, id }) => {
    return ({
      ...state,
      [notificationType]: state[notificationType].filter((notification: Types.Notification) => notification.id !== id)
    });
  }),
);
