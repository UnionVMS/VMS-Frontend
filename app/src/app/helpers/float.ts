export const truncFloat = (val: number, decimals: number) => {
  const d = Math.pow(10, decimals);
  return Math.floor(val * d) / d;
};
