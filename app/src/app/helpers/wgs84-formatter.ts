import { truncFloat } from '@app/helpers/float';

export const convertDDToDDM = (latitude: number, longitude: number, decimals = 4) => {
  const verticalDirection = (latitude > 0 ? 'N' : 'S');
  const horizontalDirection = (longitude > 0 ? 'E' : 'W');

  const absLatitude = Math.abs(latitude);
  const absLongitude = Math.abs(longitude);

  const latitudeMinute = calculateMinuteOrSecond(absLatitude);
  const longitudeMinute = calculateMinuteOrSecond(absLongitude);

  return {
    latitude: verticalDirection + ' ' + truncFloat(absLatitude, 0) + '° ' + truncFloat(latitudeMinute, decimals) + '\'',
    longitude: horizontalDirection + ' ' + truncFloat(absLongitude, 0) + '° ' + truncFloat(longitudeMinute, decimals) + '\''
  };
};

// Unfortunatly we need to do this calculation as tough it's an integear.
// And we need to round the value half way through to prevent rounding errors in the end.
const calculateMinuteOrSecond = (latOrLong: number) => {
  const maxNumberOfDecimalsAJsFloatCanStore = 17;
  const roundingErrorDecimals = 5;
  const intConversionNumber = Math.pow(10, maxNumberOfDecimalsAJsFloatCanStore);

  return Math.round(
      (60 * ((intConversionNumber * latOrLong) % intConversionNumber)) / Math.pow(10, roundingErrorDecimals)
    ) / Math.pow(10, maxNumberOfDecimalsAJsFloatCanStore - roundingErrorDecimals);
};

export const convertDDToDMS = (latitude: number, longitude: number, decimals = 2) => {
  const verticalDirection = (latitude > 0 ? 'N' : 'S');
  const horizontalDirection = (longitude > 0 ? 'E' : 'W');

  const absLatitude = Math.abs(latitude);
  const absLongitude = Math.abs(longitude);

  const latitudeMinute = calculateMinuteOrSecond(absLatitude);
  const longitudeMinute = calculateMinuteOrSecond(absLongitude);

  const latitudeSecond = calculateMinuteOrSecond(latitudeMinute);
  const longitudeSecond = calculateMinuteOrSecond(longitudeMinute);

  return {
    latitude: verticalDirection + ' ' +
      truncFloat(latitude, 0) + '° ' +
      truncFloat(latitudeMinute, 0) + '\' ' +
      truncFloat(latitudeSecond, decimals) + '"',
    longitude: horizontalDirection + ' ' +
      truncFloat(longitude, 0) + '° ' +
      truncFloat(longitudeMinute, 0) + '\' ' +
      truncFloat(longitudeSecond, decimals) + '"'
  };
};


export const convertDDMToDD = (latitude: string, longitude: string) => {
  const verticalDirection = latitude.substring(0, 1) === 'N' ? 1 : -1;
  const horizontalDirection = longitude.substring(0, 1) === 'E' ? 1 : -1;

  const [latitudePrimary, latitudeMinute] = latitude.substring(2, latitude.length - 1).split('° ');
  const [longitudePrimary, longitudeMinute] = longitude.substring(2, longitude.length - 1).split('° ');

  const maxNumberOfDecimalsAJsFloatCanStore = 17;
  const intConversionNumber = Math.pow(10, maxNumberOfDecimalsAJsFloatCanStore);

  return {
    latitude: verticalDirection * ((
      intConversionNumber * parseInt(latitudePrimary, 10) +
      intConversionNumber * (parseFloat(latitudeMinute) / 60)
    ) / intConversionNumber ),
    longitude: horizontalDirection * ((
      intConversionNumber * parseInt(longitudePrimary, 10) +
      intConversionNumber * (parseFloat(longitudeMinute) / 60)
    ) / intConversionNumber )
  };
};
