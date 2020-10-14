import * as NotificationsActions from '@data/notifications/notifications.actions';

export const apiErrorHandler = (store: any) => (response: any, index: number) => {
  if(typeof response !== 'undefined' && response !== null && (typeof response.code !== 'undefined' && typeof response.description !== 'undefined')) {
    console.error('API Error!\n', `Error code: ${response.code}\n`, `Error description: ${response.description}`);
    store.dispatch(NotificationsActions.addError($localize`:@@ts-api-error:An API error occured!<br />\nThe application might not work as expected.<br />\nPlease reload the page and try again, if the issue persists, please contact system administrator.`));
    return false;
  }
  return true;
};
