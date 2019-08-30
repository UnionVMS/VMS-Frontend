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
