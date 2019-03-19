export const deg2rad = (degrees) => {
  return Math.sin(degrees * Math.PI / 180);
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
