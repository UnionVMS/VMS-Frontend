export type UserData = Readonly<{
  username: string;
}>;

export type JwtTokenData = Readonly<{
  exp?: number,
  features?: ReadonlyArray<number>,
  iat?: number,
  iss?: string,
  jti?: string;
  sub?: string,
  userName?: string,
}>;
/*

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

 */


export type Role = Readonly<{
  name: string;
  features: ReadonlyArray<any>;
}>;

export type Scope = Readonly<{
  name: string;
  datasets: ReadonlyArray<any>;
  activeFrom: number;
  activeTo: number;
}>;


export type User = Readonly<{
  jwtToken: Readonly<{
    raw: string;
    decoded: JwtTokenData;
  }>;
  data: UserData;
  role: Role;
  scope: Scope;
}>;

export type State = Readonly<{
  user: User|null;
  fishingActivityUnlocked: boolean;
  loggedOutPopupActive: boolean;
  timeToLogout: number | null;
}>;
