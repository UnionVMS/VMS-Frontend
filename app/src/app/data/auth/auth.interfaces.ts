export interface UserData {
  username: string;
}

export interface JwtTokenData {
  raw: string;
  decoded: any;
}

export type Role = Readonly<{
  name: string;
  features: ReadonlyArray<any>;
}>;

export type Scope = Readonly<{
  name: string;
  datasets: ReadonlyArray<any>;
  activeFrom: string;
  activeTo: string;
}>;


export interface User {
  jwtToken: JwtTokenData;
  data: UserData;
  role: Role;
  scope: Scope;
}

export interface State {
  user: User|null;
}
