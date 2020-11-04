import { createAction, props } from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';

export const addNotification = createAction(
  '[Notifications] Add',
  (properties: { notificationType: string, notification: string, autoDismissInMs?: number }) => {
    return {
      ...properties,
      id: uuidv4()
    };
  }
);

export const addSuccess = (notification: string, autoDismissInMs: number | null = 3000) => {
  if(autoDismissInMs === null) {
    return addNotification({ notificationType: 'success', notification });
  }

  return addNotification({ notificationType: 'success', notification, autoDismissInMs });
};

export const addNotice = (notification: string, autoDismissInMs?: number) => {
  return addNotification({ notificationType: 'notices', notification, autoDismissInMs});
};

export const addError = (notification: string, autoDismissInMs?: number) => {
  return addNotification({ notificationType: 'errors', notification, autoDismissInMs});
};

export const dismiss = createAction(
  '[Notifications] dismiss',
  props<{ notificationType: string, id: string }>()
);
