// @ts-ignore
import moment from 'moment-timezone';

export const formatUnixtime = (unixtime: number | null) => {
  if (typeof unixtime === 'undefined' || unixtime === null) {
    return '';
  }
  return moment(unixtime).format('YYYY-MM-DD HH:mm');
};
