import {
  convertDDMToDD,
  convertDDToDDM,
  convertDDToDMS,
  convertDDMToDDJustNumbers,
} from './wgs84-formatter';
import { truncFloat } from '@app/helpers/float';

describe('wg84-formatter', () => {

  it('convertDDMToDD and back with convertDDToDDM', () => {
    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 99; j++) {
        let latMinutes = `${i}.${j}`;
        let latMinutes4d = `${i}.${j}00`;
        if(j === 0) {
          latMinutes = `${i}.00`;
          latMinutes4d = `${i}.0000`;
        } else if(j < 10) {
          latMinutes = `${i}.0${j}`;
          latMinutes4d = `${i}.0${j}00`;
        }
        const latitude = `N 20° ${latMinutes}'`;
        const latitude4d = `N 20° ${latMinutes4d}'`;

        j++;
        let longMinutes = `${i}.${j}`;
        let longMinutes4d = `${i}.${j}00`;
        if(j < 10) {
          longMinutes = `${i}.0${j}`;
          longMinutes4d = `${i}.0${j}00`;
        }
        const longitude = `E 21° ${longMinutes}'`;
        const longitude4d = `E 21° ${longMinutes4d}'`;

        const dd = convertDDMToDD(latitude4d, longitude4d);
        const ddm = convertDDToDDM(dd.latitude, dd.longitude, 4);

        expect(ddm.latitude).toBe(latitude4d);
        expect(ddm.longitude).toBe(longitude4d);

        const ddmPrecision2 = convertDDToDDM(dd.latitude, dd.longitude, 2);

        expect(ddmPrecision2.latitude).toBe(latitude);
        expect(ddmPrecision2.longitude).toBe(longitude);
      }
    }
  });
  it('convertDDMToDDJustNumbers', () => {
        const latitude = 57;
        const latitudeDM = 56.680;
        const longitude = 11;
        const longitudeDM = 33.840;
        const dd = convertDDMToDDJustNumbers(latitude, latitudeDM, longitude, longitudeDM);
        const expectedLat = 57.94;
        const expectedLong = 11.56;
        expect(dd.latitude).toBe(expectedLat);
        expect(dd.longitude).toBe(expectedLong);
  });
});
