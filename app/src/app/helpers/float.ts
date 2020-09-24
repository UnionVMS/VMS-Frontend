export const truncFloat = (val: number, decimals: number, ignorePrecisionCheck = false) => {

  // Not needed when decimals are 0
  if(!ignorePrecisionCheck && decimals !== 0) {
    const valSplit = val.toString().split('.');

    // If we truncate the float when we have less precision then the requested decimal value it will
    // in some cases be a rounding error.
    if(typeof valSplit[1] === 'undefined' || valSplit[1].length <= decimals) {
      return val;
    }
  }

  const d = Math.pow(10, decimals);
  return Math.floor(val * d) / d;
};
