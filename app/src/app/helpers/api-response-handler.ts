import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import * as AuthActions from '@data/auth/auth.actions';

const handleBody = (store: Store<State>, body: any) => {
  if(typeof body !== 'undefined' && body !== null && (typeof body.code !== 'undefined' && typeof body.description !== 'undefined')) {
    console.error('API Error!\n', `Error code: ${body.code}\n`, `Error description: ${body.description}`);
    store.dispatch(NotificationsActions.addError($localize`:@@ts-api-error:An API error occured!<br />\nThe application might not work as expected.<br />\nPlease reload the page and try again, if the issue persists, please contact system administrator.`));
    return false;
  }
  return true;
};

export const apiErrorHandler = (store: Store<State>) => (response: any, index: number, withHeaders = false) => {
  if(withHeaders) {
    if(response.ok === true && response.status === 200) {
      return handleBody(store, response.body);
    } else {
      console.error('API Error - HTTP error!\n', `Error code: ${response.status}\n`, `Error description: ${response.statusText}`);
      store.dispatch(NotificationsActions.addError($localize`:@@ts-api-error:An API error occured!<br />\nThe application might not work as expected.<br />\nPlease reload the page and try again, if the issue persists, please contact system administrator.`));
      return false;
    }
  } else {
    return handleBody(store, response);
  }
};

export const apiUpdateTokenHandler = (store: Store<State>) => (response: any) => {
  store.dispatch(AuthActions.updateToken({ jwtToken: response.headers.get('Authorization') }));
  return response;
};
