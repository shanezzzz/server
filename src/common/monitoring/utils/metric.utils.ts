export const makeHistogramBuckets = (
  start: number,
  width: number,
  count: number,
): number[] => {
  const buckets: number[] = [];
  for (let i = 0; i < count; i++) {
    buckets.push(start + width * i);
  }
  return buckets;
};
