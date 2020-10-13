import {
  convertDDMToDD,
  convertDDToDDM,
  convertDDToDMS,
} from './wgs84-formatter';
import { truncFloat } from '@app/helpers/float';

describe('wg84-formatter', () => {

  it('convertDDMToDD and back with convertDDToDDM', () => {
    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 99; j++) {
        let latMinutes = `${i}.${j}`;
        if(j === 0) {
          latMinutes = `${i}`;
        } else if(j < 10) {
          latMinutes = `${i}.0${j}`;
        } else if(j % 10 === 0) {
          latMinutes = `${i}.${j / 10}`;
        }
        const latitude = `N 20° ${latMinutes}'`;

        j++;
        let longMinutes = `${i}.${j}`;
        if(j < 10) {
          longMinutes = `${i}.0${j}`;
        } else if(j % 10 === 0) {
          longMinutes = `${i}.${j / 10}`;
        }
        const longitude = `E 21° ${longMinutes}'`;

        const dd = convertDDMToDD(latitude, longitude);
        const ddm = convertDDToDDM(dd.latitude, dd.longitude, 4);

        expect(ddm.latitude).toBe(latitude);
        expect(ddm.longitude).toBe(longitude);

        const ddmPrecision2 = convertDDToDDM(dd.latitude, dd.longitude, 2);

        expect(ddmPrecision2.latitude).toBe(latitude);
        expect(ddmPrecision2.longitude).toBe(longitude);
      }
    }
  });
});
