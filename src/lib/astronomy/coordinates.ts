/**
 * Bathyx — Coordinate Utilities
 * Convert between geographic (lon/lat/depth) and 3D spherical coordinates
 */

const DEG2RAD = Math.PI / 180;

/**
 * Convert lon/lat to unit vector on a sphere
 */
export function lonLatToVector(
  lon: number,
  lat: number,
  radius: number = 1
): [number, number, number] {
  const phi = (90 - lat) * DEG2RAD;
  const theta = lon * DEG2RAD;

  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
}

/**
 * Convert 3D vector back to lon/lat
 */
export function vectorToLonLat(x: number, y: number, z: number): { lon: number; lat: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - Math.acos(y / r) / DEG2RAD;
  const lon = Math.atan2(z, x) / DEG2RAD;
  return { lon, lat };
}

/**
 * Convert lon/lat/depth to 3D position on the ocean floor sphere
 * @param lon longitude in degrees
 * @param lat latitude in degrees
 * @param depth depth in meters (negative = below sea level)
 * @param baseRadius base sphere radius in world units
 * @param depthScale how much to scale depth (1m depth = depthScale world units)
 */
export function depthToSphere(
  lon: number,
  lat: number,
  depth: number,
  baseRadius: number = 500,
  depthScale: number = 0.02
): [number, number, number] {
  const r = baseRadius + depth * depthScale;
  return lonLatToVector(lon, lat, r);
}

/**
 * Haversine distance between two lon/lat points (in km)
 */
export function haversineDistance(
  lon1: number, lat1: number,
  lon2: number, lat2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * DEG2RAD;
  const dLon = (lon2 - lon1) * DEG2RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format depth for display
 */
export function formatDepth(depth: number): string {
  if (depth >= 0) return `${Math.round(depth)}m elevation`;
  return `${Math.abs(Math.round(depth)).toLocaleString()}m depth`;
}

/**
 * Format coordinates for display
 */
export function formatCoords(lon: number, lat: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

/**
 * Interpolate along a path of coordinates
 */
export function interpolatePath(
  coords: [number, number][],
  numPoints: number
): [number, number][] {
  if (coords.length < 2) return coords;

  const result: [number, number][] = [];

  // Calculate total path length
  let totalLength = 0;
  const segments: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    const d = haversineDistance(
      coords[i - 1][0], coords[i - 1][1],
      coords[i][0], coords[i][1]
    );
    segments.push(d);
    totalLength += d;
  }

  // Generate evenly spaced points
  const step = totalLength / (numPoints - 1);
  let accumulated = 0;
  let segIndex = 0;
  let segAccum = 0;

  result.push([coords[0][0], coords[0][1]]);

  for (let i = 1; i < numPoints - 1; i++) {
    const targetDist = step * i;

    while (segIndex < segments.length - 1 && accumulated + segments[segIndex] < targetDist) {
      accumulated += segments[segIndex];
      segIndex++;
    }

    const segRemaining = targetDist - accumulated;
    const t = segRemaining / segments[segIndex];

    const [lon1, lat1] = coords[segIndex];
    const [lon2, lat2] = coords[segIndex + 1];

    result.push([
      lon1 + (lon2 - lon1) * t,
      lat1 + (lat2 - lat1) * t
    ]);
  }

  result.push([coords[coords.length - 1][0], coords[coords.length - 1][1]]);

  return result;
}
