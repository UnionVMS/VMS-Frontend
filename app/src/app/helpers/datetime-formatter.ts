// @ts-ignore
import moment from 'moment-timezone';

export const formatUnixdate = (unixtime: number | null) => {
  if (typeof unixtime === 'undefined' || unixtime === null) {
    return '';
  }
  return moment(unixtime).format('YYYY-MM-DD');
};

export const formatUnixtime = (unixtime: number | null) => {
  if (typeof unixtime === 'undefined' || unixtime === null) {
    return '';
  }
  return moment(unixtime).format('YYYY-MM-DD HH:mm');
};

export const formatUnixtimeWithDot = (unixtime: number | null) => {
  if (typeof unixtime === 'undefined' || unixtime === null) {
    return '';
  }
  return moment(unixtime).format('YYYY-MM-DD • HH:mm');
};
