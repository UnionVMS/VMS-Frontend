import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import * as AuthActions from '@data/auth/auth.actions';

const handleBody = (store: Store<State>, body: any) => {
  if(typeof body !== 'undefined' && body !== null && (typeof body.code !== 'undefined' && typeof body.description !== 'undefined')) {
    console.error(
      'API Error!\n',
      `Error code: ${body.code}\n`,
      `Error description: ${body.description}\n`,
      'Caller location ' + (new Error()).stack.split('\n')[2].trim()
    );
    store.dispatch(NotificationsActions.addError($localize`:@@ts-api-error:An API error occured!\nThe application might not work as expected.\nPlease reload the page and try again, if the issue persists, please contact system administrator.`));
    return false;
  }
  return true;
};

export const apiErrorHandler = (store: Store<State>) => (response: any, index: number, withHeaders = true) => {
  if(withHeaders) {
    if(response.ok === true && response.status === 200) {
      return handleBody(store, response.body);
    } else {
      console.error(
        'API Error - HTTP error!\n',
        `Error code: ${response.status}\n`,
        `Error description: ${response.statusText}\n`,
        'Caller location ' + (new Error()).stack.split('\n')[2].trim()
      );
      store.dispatch(NotificationsActions.addError($localize`:@@ts-api-error:An API error occured!\nThe application might not work as expected.\nPlease reload the page and try again, if the issue persists, please contact system administrator.`));
      return false;
    }
  } else {
    return handleBody(store, response);
  }
};

export const apiUpdateTokenHandler = (store: Store<State>) => (response: any) => {
  const authToken = response.headers.get('Authorization');
  if(authToken > '') {
    store.dispatch(AuthActions.updateToken({ jwtToken: response.headers.get('Authorization') }));
  } else {
    // TODO: Remove, this is debug:
    console.error('Authorization missing in response');
  }
  return response;
};
