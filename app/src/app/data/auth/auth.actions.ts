import { Action } from '@ngrx/store';

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

  constructor(public payload: any) {}
}

export class LoginFailed implements Action {
  readonly type = ActionTypes.LoginFailed;
  constructor(public payload: any) {}
}
