export const formatDate = (datetime) => {
  const date = new Date(datetime);
  const iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
  return iso[1] + ' ' + iso[2];
};

export const deg2rad = (degrees: number) => {
  return degrees * Math.PI / 180;
};

export const radToDeg = (rad: number) => {
  return (180.0 * (rad / Math.PI));
};

export const intToRGB = (i: number) => {
  // tslint:disable-next-line
  const c = (i & 0x00FFFFFF).toString(16).toUpperCase();

  return '00000'.substring(0, 6 - c.length) + c;
};

export const hashCode = (str: string) => { // java String#hashCode
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // tslint:disable-next-line:no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

/**
 * Returns the destination point from a given point, having travelled the given distance
 * on the given initial bearing.
 *
 * @param   lat - initial latitude in decimal degrees (eg. 50.123)
 * @param   lon - initial longitude in decimal degrees (e.g. -4.321)
 * @param   speed - Distance travelled / hour (metres).
 * @param   time - Traveltime in minutes.
 * @param   bearing - Initial bearing (in degrees from north).
 * @returns destination point as [latitude,longitude] (e.g. [50.123, -4.321])
 *
 * @example
 *     var p = destinationPoint(51.4778, -0.0015, 7794, 300.7); // 51.5135°N, 000.0983°W
 */
export const destinationPoint = (lat: number, lon: number, speed: number, time: number, bearing: number) => {
   const radius = 6371e3; // (Mean) radius of earth

   const distance = speed * (time / 60);

   const toRadians = (v) => v * Math.PI / 180;
   const toDegrees = (v) => v * 180 / Math.PI;

   // sinφ2 = sinφ1·cosδ + cosφ1·sinδ·cosθ
   // tanΔλ = sinθ·sinδ·cosφ1 / cosδ−sinφ1·sinφ2
   // see mathforum.org/library/drmath/view/52049.html for derivation

   const δ = Number(distance) / radius; // angular distance in radians
   const θ = toRadians(Number(bearing));

   const φ1 = toRadians(Number(lat));
   const λ1 = toRadians(Number(lon));

   const sinφ1 = Math.sin(φ1);
   const cosφ1 = Math.cos(φ1);
   const sinδ = Math.sin(δ);
   const cosδ = Math.cos(δ);
   const sinθ = Math.sin(θ);
   const cosθ = Math.cos(θ);

   const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosθ;
   const φ2 = Math.asin(sinφ2);
   const y = sinθ * sinδ * cosφ1;
   const x = cosδ - sinφ1 * sinφ2;
   const λ2 = λ1 + Math.atan2(y, x);

   return [toDegrees(φ2), (toDegrees(λ2) + 540) % 360 - 180]; // normalise to −180..+180°
};
