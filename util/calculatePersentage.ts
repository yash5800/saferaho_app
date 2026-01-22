export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return (part / total) * 100;
};
