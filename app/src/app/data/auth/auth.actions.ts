import { Action } from '@ngrx/store';
import jwtDecode from 'jwt-decode';

export enum ActionTypes {
  Login         = '[Auth] Login',
  LoginSuccess  = '[Auth] Login Successfull',
  LoginFailed     = '[Auth] Login Failed',
}

export class Login implements Action {
  readonly type = '[Auth] Login';

  constructor(public payload: { username: string; password: string }) {}
}

export class LoginSuccess implements Action {
  readonly type = ActionTypes.LoginSuccess;
  public payload;
  constructor(jwtToken: string) {
    const tokenDecoded = jwtDecode(jwtToken);
    this.payload = {
      jwtToken: { raw: jwtToken, decoded: tokenDecoded },
      data: { username: tokenDecoded.userName }
    };
  }
}

export class LoginFailed implements Action {
  readonly type = ActionTypes.LoginFailed;
  constructor(public payload: any) {}
}
