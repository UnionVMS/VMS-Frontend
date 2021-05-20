import { createAction, props } from '@ngrx/store';
import jwtDecode from 'jwt-decode';
import * as AuthTypes from './auth.types';

export const activateLoggedOutPopup = createAction(
  '[Auth] Activate logged out popup',
);

export const setTimeToLogout = createAction(
  '[Auth] Set time to logout',
  props<{ timeToLogout: number | null }>()
);

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
    const tokenDecoded: any = jwtDecode(jwtToken);
    return {
      payload: {
        jwtToken: { raw: jwtToken, decoded: tokenDecoded },
        data: { username: tokenDecoded.userName }
      }
    };
  }
);

export const updateToken = createAction(
  '[Auth] Update token',
  ({ jwtToken }: { jwtToken: string }) => {
    const tokenDecoded: any = jwtDecode(jwtToken);
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
);

export const isAdmin = createAction(
  '[Auth] isAdmin',
);

export const setRoleAndScope = createAction(
  '[Auth] Set role and scrope',
  props<{ role: AuthTypes.Role, scope: AuthTypes.Scope }>()
);

export const unlockFishingActivity = createAction(
  '[Auth] Unlock fishing activity',
);
