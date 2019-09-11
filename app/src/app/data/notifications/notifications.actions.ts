import { createAction, props } from '@ngrx/store';


export const addSuccess = (notification: string) => {
  return addNotification({ notificationType: 'success', notification});
};

export const addNotice = (notification: string) => {
  return addNotification({ notificationType: 'notice', notification});
};

export const addError = (notification: string) => {
  return addNotification({ notificationType: 'error', notification});
};

export const addNotification = createAction(
  '[MapSettings] Set visibility for asset names',
  props<{ notificationType: string, notification: string }>()
);
