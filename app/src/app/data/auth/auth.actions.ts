import { createAction, props } from '@ngrx/store';
import jwtDecode from 'jwt-decode';

export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const loginFailed = createAction(
  '[Auth] Login Failed',
  props<{ error: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Successfull',
  ({ jwtToken }: { jwtToken: string }) => {
    const tokenDecoded = jwtDecode(jwtToken);
    return {
      payload: {
        jwtToken: { raw: jwtToken, decoded: tokenDecoded },
        data: { username: tokenDecoded.userName }
      }
    };
  }
);

export const logout = createAction(
  '[Auth] Logut',
  (payload: void) => {
    delete window.localStorage.authToken;
    localStorage.removeItem("ngStorage-token");
    localStorage.removeItem("ngStorage-roleName");
    localStorage.removeItem("ngStorage-scopeName");
    return {};
  }
);

export const isAdmin = createAction(
  '[Auth] isAdmin',
);
