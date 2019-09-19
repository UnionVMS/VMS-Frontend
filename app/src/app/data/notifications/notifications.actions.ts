import { createAction, props } from '@ngrx/store';

export const addNotification = createAction(
  '[Notifications] Add',
  props<{ notificationType: string, notification: string }>()
);

export const addSuccess = (notification: string) => {
  return addNotification({ notificationType: 'success', notification});
};

export const addNotice = (notification: string) => {
  return addNotification({ notificationType: 'notices', notification});
};

export const addError = (notification: string) => {
  return addNotification({ notificationType: 'errors', notification});
};

export const dismiss = createAction(
  '[Notifications] dismiss',
  props<{ notificationType: string, index: number }>()
);
