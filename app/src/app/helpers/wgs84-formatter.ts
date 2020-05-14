import { truncFloat } from '@app/helpers/float';

export const convertDDToDDM = (latitude: number, longitude: number, decimals = 4) => {
  const verticalDirection = (latitude > 0 ? 'N' : 'S');
  const horizontalDirection = (longitude > 0 ? 'E' : 'W');

  const absLatitude = Math.abs(latitude);
  const absLongitude = Math.abs(longitude);

  const latitudeMinute = 60 * (absLatitude % 1);
  const longitudeMinute = 60 * (absLongitude % 1);

  return {
    latitude: verticalDirection + ' ' + truncFloat(absLatitude, 0) + '° ' + truncFloat(latitudeMinute, decimals) + '\'',
    longitude: horizontalDirection + ' ' + truncFloat(absLongitude, 0) + '° ' + truncFloat(longitudeMinute, decimals) + '\''
  };
};

export const convertDDToDMS = (latitude: number, longitude: number, decimals = 2) => {
  const verticalDirection = (latitude > 0 ? 'N' : 'S');
  const horizontalDirection = (longitude > 0 ? 'E' : 'W');

  const absLatitude = Math.abs(latitude);
  const absLongitude = Math.abs(longitude);

  const latitudeMinute = 60 * (absLatitude % 1);
  const longitudeMinute = 60 * (absLongitude % 1);

  const latitudeSecond = 60 * (latitudeMinute % 1);
  const longitudeSecond = 60 * (longitudeMinute % 1);

  return {
    latitude: verticalDirection +
      truncFloat(latitude, 0) + '° ' +
      truncFloat(latitudeMinute, 0) + '\' ' +
      truncFloat(latitudeSecond, decimals) + '"',
    longitude: horizontalDirection +
      truncFloat(longitude, 0) + '° ' +
      truncFloat(longitudeMinute, 0) + '\' ' +
      truncFloat(longitudeSecond, decimals) + '"'
  };
};


export const convertDDMToDD = (latitude: string, longitude: string) => {
  const verticalDirection = latitude.substring(0, 1) === 'N' ? 1 : -1;
  const horizontalDirection = longitude.substring(0, 1) === 'E' ? 1 : -1;

  return {
    latitude: verticalDirection * (
      parseInt(latitude.substring(2, 4), 10) +
      (parseFloat(latitude.substring(6, latitude.length - 1)) / 60)
    ),
    longitude: horizontalDirection * (
      parseInt(longitude.substring(2, 4), 10) +
      (parseFloat(longitude.substring(6, longitude.length - 1)) / 60)
    )
  };
};
