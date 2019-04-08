import { Action } from '@ngrx/store';
import { ActionTypes } from './auth.actions';

export interface UserData {
  username: string;
}

export interface JwtTokenData {
  raw: string;
  decoded: any;
}

export interface User {
  jwtToken: JwtTokenData;
  data: UserData;
}

export interface State {
  user: User|null;
}

const initialState: State = {
  user: null,
};

export function authReducer(state = initialState, { type, payload }) {
  switch (type) {
    case ActionTypes.LoginSuccess:
      return { ...state, user: { ...state.user, ...payload } };

    case ActionTypes.LoginFail:
      return { ...state };

    default:
      return state;
  }
}
