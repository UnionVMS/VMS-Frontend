import { User } from '../auth.types';

const UserStub: User = {
  jwtToken: {
    raw: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ1c20vYXV0aGVudGljYXRpb24iLCJpc3MiOiJ1c20iLCJzdWIiOiJhdXRoZW50aWNhdGlvbiIsImlhdCI6MTU4ODc1OTAxMiwiZXhwIjoxNTg4Nzg3ODEyLCJ1c2VyTmFtZSI6InRlc3QiLCJmZWF0dXJlcyI6W119.vJyaj54V1TjJrpt-Iitmyw12WmXDwniVTiez12zDqCU',
    decoded: {
      jti: 'usm/authentication',
      iss: 'usm',
      sub: 'authentication',
      iat: 1588759012,
      exp: 1588787812,
      userName: 'test',
      features: []
    }
  },
  data: {
    username: 'test'
  },
  role: {
    name: 'test',
    features: []
  },
  scope: {
    name: 'All Vessels',
    datasets: [],
    activeFrom: 1558656000000,
    activeTo: 1801353600000
  },
};

export default UserStub;
