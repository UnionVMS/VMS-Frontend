export const formatDate = (datetime) => {
  const date = new Date(datetime);
  const iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)
  return iso[1] + ' ' + iso[2];
}

export const deg2rad = (degrees) => {
  return degrees * Math.PI / 180;
}

export const radToDeg = (rad) => {
  return (180.0 * (rad / Math.PI));
}

export const intToRGB = (i) => {
  const c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

  return '00000'.substring(0, 6 - c.length) + c;
}

export const hashCode = (str) => { // java String#hashCode
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

/**
* Returns the destination point from a given point, having travelled the given distance
* on the given initial bearing.
*
* @param   {number} lat - initial latitude in decimal degrees (eg. 50.123)
* @param   {number} lon - initial longitude in decimal degrees (e.g. -4.321)
* @param   {number} distance - Distance travelled (metres).
* @param   {number} bearing - Initial bearing (in degrees from north).
* @returns {array} destination point as [latitude,longitude] (e.g. [50.123, -4.321])
*
* @example
*     var p = destinationPoint(51.4778, -0.0015, 7794, 300.7); // 51.5135°N, 000.0983°W
*/
export const destinationPoint = (lat, lon, distance, bearing) => {
   const radius = 6371e3; // (Mean) radius of earth

   const toRadians = function(v) { return v * Math.PI / 180; };
   const toDegrees = function(v) { return v * 180 / Math.PI; };

   // sinφ2 = sinφ1·cosδ + cosφ1·sinδ·cosθ
   // tanΔλ = sinθ·sinδ·cosφ1 / cosδ−sinφ1·sinφ2
   // see mathforum.org/library/drmath/view/52049.html for derivation

   var δ = Number(distance) / radius; // angular distance in radians
   var θ = toRadians(Number(bearing));

   var φ1 = toRadians(Number(lat));
   var λ1 = toRadians(Number(lon));

   var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
   var sinδ = Math.sin(δ), cosδ = Math.cos(δ);
   var sinθ = Math.sin(θ), cosθ = Math.cos(θ);

   var sinφ2 = sinφ1*cosδ + cosφ1*sinδ*cosθ;
   var φ2 = Math.asin(sinφ2);
   var y = sinθ * sinδ * cosφ1;
   var x = cosδ - sinφ1 * sinφ2;
   var λ2 = λ1 + Math.atan2(y, x);

   return [toDegrees(φ2), (toDegrees(λ2)+540)%360-180]; // normalise to −180..+180°
}
