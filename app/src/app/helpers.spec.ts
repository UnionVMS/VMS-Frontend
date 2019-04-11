import {
  formatDate,
  deg2rad,
  radToDeg,
  intToRGB,
  hashCode,
  destinationPoint
} from './helpers';

describe('Helpers', () => {
  describe('formatDate', () => {
    it('should return a correctly formated date.', () => {
      const currentTime = 1554824030 * 1000;
      const formattedDate = formatDate(currentTime);
      expect(formattedDate).toBe('2019-04-09 15:33:50');
    });
  });

  describe('deg2rad', () => {
    it('should return the correct radians.', () => {
      expect(deg2rad(180)).toBe(Math.PI);
      expect(deg2rad(360)).toBe(2 * Math.PI);
      expect(deg2rad(-180)).toBe(-Math.PI);
      expect(deg2rad(-90)).toBe(-Math.PI / 2);
      expect(deg2rad(450)).toBe(2 * Math.PI + Math.PI / 2);
      expect(deg2rad(451)).not.toBe(2 * Math.PI + Math.PI / 2);
    });
  });

  describe('radToDeg', () => {
    it('should return the correct degrees.', () => {
      expect(radToDeg(Math.PI)).toBe(180);
      expect(radToDeg(2 * Math.PI)).toBe(360);
      expect(radToDeg(-Math.PI)).toBe(-180);
      expect(radToDeg(-Math.PI / 2)).toBe(-90);
      expect(radToDeg(2 * Math.PI + Math.PI / 2)).toBe(450);
      expect(radToDeg(2 * Math.PI + Math.PI / 2)).not.toBe(451);
    });
  });

  describe('intToRGB', () => {
    it('should return the correct RGB color.', () => {
      expect(intToRGB(1234567)).toBe('12D687');
      expect(intToRGB(6234567)).toBe('5F21C7');
      expect(intToRGB(4)).toBe('000004');
      expect(intToRGB(40000000000000000)).toBe('040000');
      expect(intToRGB(-4)).toBe('FFFFFC');
      expect(intToRGB(40000000213000000000)).toBe('6A2000');
    });
  });

  describe('hashCode', () => {
    it('should return the correct integer.', () => {
      expect(hashCode('This is a test')).toBe(5708935621);
      expect(hashCode('A2bala ala')).toBe(2300926075);
      expect(hashCode('')).toBe(0);
      expect(hashCode('a')).toBe(97);
    });
  });

  describe('destinationPoint', () => {
    it('should return the correct destination point.', () => {
      const latitude = 65.15318166666667;
      const longitude = 23.17778;
      const speed = 10.5;
      const minutes = 30;
      const heading = 185;
      expect(destinationPoint(latitude, longitude, speed, minutes, heading))
        .toEqual([65.15313463194703, 23.177770206903915]);
    });
  });


});
