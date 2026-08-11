export const calculateEstimatedFare = (estimatedDistance) => {
  const distance = Number(estimatedDistance);

  if (!Number.isFinite(distance) || distance <= 0) {
    return 0;
  }

  return Math.round((100 + distance * 15) * 100) / 100;
};

