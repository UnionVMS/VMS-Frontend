import { AuthReducer, AuthActions, AuthSelectors } from '.';

describe('AuthReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const { initialState } = AuthReducer;
      const action = { type: undefined, payload: undefined };
      const state = AuthReducer.authReducer(undefined, action);

      expect(state).toBe(initialState);
    });
  });

  const loginPayload = {
    jwtToken: {
      // tslint:disable-next-line:max-line-length
      raw: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ1c20vYXV0aGVudGljYXRpb24iLCJpc3MiOiJ1c20iLCJzdWIiOiJhdXRoZW50aWNhdGlvbiIsImlhdCI6MTU1NDgxOTQxMywiZXhwIjoxNTU0ODIzMzAyLCJ1c2VyTmFtZSI6InZtc191c2VyIn0.6lLd-GQOtz4VhkAYqWeCLr7_OaMXI4F9JpSj6eaeCNU',
      decoded: {
        jti: 'usm/authentication',
        iss: 'usm',
        sub: 'authentication',
        iat: 1554819413,
        exp: 1554821213,
        userName: 'vms_user'
      }
    },
    data: {
      username: 'vms_user'
    }
  };

  describe('ActionTypes.LoginSuccess', () => {
    it('should return a acceptable user object.', () => {
      const state = AuthReducer.authReducer(undefined, new AuthActions.LoginSuccess(loginPayload));

      expect(state).toEqual({ user: loginPayload });
    });
  });

  describe('ActionTypes.LoginFailed', () => {
    it('should return a acceptable user object.', () => {
      const { initialState } = AuthReducer;
      const state = AuthReducer.authReducer(undefined, new AuthActions.LoginFailed({ error: 'failed' }));

      expect(state).toEqual(initialState);
    });
  });
});
