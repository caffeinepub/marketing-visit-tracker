// Haversine formula to calculate distance between two GPS coordinates in km
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function calculateTotalDistance(
  visits: { latitude: number; longitude: number }[],
): number {
  let total = 0;
  for (let i = 1; i < visits.length; i++) {
    total += haversineDistance(
      visits[i - 1].latitude,
      visits[i - 1].longitude,
      visits[i].latitude,
      visits[i].longitude,
    );
  }
  return total;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function visitDateToDate(visitDate: bigint): Date {
  return new Date(Number(visitDate / 1_000_000n));
}

export function dateToVisitDate(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}
