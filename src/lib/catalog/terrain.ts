/**
 * Bathyx — Bathymetric Terrain Generator
 * Procedural ocean floor terrain using Perlin-like noise
 */

import type { TerrainPoint } from './types';

/**
 * Simple 2D value noise (no external dependency)
 */
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

/**
 * Fractal Brownian Motion noise
 */
function fbm(x: number, y: number, octaves: number = 6): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Generate terrain depth at a given lon/lat
 * Incorporates realistic ocean basin features
 */
export function getTerrainDepth(lon: number, lat: number): number {
  // Scale coordinates for noise
  const nx = lon * 0.02;
  const ny = lat * 0.02;

  // Base continental shelf
  const continentNoise = fbm(nx * 0.5, ny * 0.5, 4);
  const isLand = continentNoise > 0.65;

  if (isLand) {
    // Land: positive elevation
    return Math.max(0, (continentNoise - 0.65) * 2000);
  }

  // Ocean depth baseline: 3000-5000m
  const baseDepth = -3500 + (fbm(nx, ny, 5) - 0.5) * 3000;

  // Mid-ocean ridge influence (elevated terrain along ridge paths)
  const ridgeInfluence = getRidgeInfluence(lon, lat);

  // Trench deepening
  const trenchInfluence = getTrenchInfluence(lon, lat);

  // Seamount bumps
  const seamountInfluence = getSeamountInfluence(lon, lat);

  // Combine
  let depth = baseDepth;
  depth += ridgeInfluence * 2000;  // ridges rise
  depth += trenchInfluence * -5000; // trenches sink
  depth += seamountInfluence * 4000; // seamounts rise

  // Add fine detail
  const detail = fbm(nx * 4, ny * 4, 3) - 0.5;
  depth += detail * 500;

  return depth;
}

/**
 * Ridge proximity influence (0-1, 1 = on ridge)
 */
function getRidgeInfluence(lon: number, lat: number): number {
  // Simplified: proximity to mid-ocean ridges
  // Mid-Atlantic Ridge: ~-30 to -45 lon, running N-S
  const midAtlanticDist = Math.abs(lon - (-35)) / 30;
  // East Pacific Rise: ~-105 to -120 lon
  const eprDist = Math.abs(lon - (-112)) / 20;

  const midAtlantic = Math.max(0, 1 - midAtlanticDist) * (1 - Math.abs(lat) / 90);
  const epr = Math.max(0, 1 - eprDist) * (1 - Math.abs(lat) / 90);

  return Math.max(midAtlantic, epr) * 0.5;
}

/**
 * Trench proximity influence (0-1, 1 = in trench)
 */
function getTrenchInfluence(lon: number, lat: number): number {
  // Mariana Trench area: ~142-144 lon, 11-13 lat
  const marianaDist = Math.sqrt(
    Math.pow((lon - 143) / 3, 2) + Math.pow((lat - 12) / 3, 2)
  );

  // Tonga Trench: ~-175 lon, -22 to -26 lat
  const tongaDist = Math.sqrt(
    Math.pow((lon - (-174)) / 3, 2) + Math.pow((lat - (-24)) / 5, 2)
  );

  // Peru-Chile: ~-71 to -76 lon, -5 to -40 lat
  const peruChileDist = Math.sqrt(
    Math.pow((lon - (-73)) / 5, 2) + Math.pow((lat - (-20)) / 15, 2)
  );

  return Math.max(
    Math.max(0, 1 - marianaDist),
    Math.max(0, 1 - tongaDist),
    Math.max(0, 1 - peruChileDist)
  );
}

/**
 * Seamount proximity influence (0-1, 1 = on peak)
 */
function getSeamountInfluence(lon: number, lat: number): number {
  // Hawaii: -155.5, 19.8
  const hawaiiDist = Math.sqrt(
    Math.pow((lon - (-155.5)) / 2, 2) + Math.pow((lat - 19.8) / 2, 2)
  );

  return Math.max(0, 1 - hawaiiDist) * 0.8;
}

/**
 * Generate a terrain grid for rendering
 */
export function generateTerrainGrid(
  resolution: number = 180
): Float32Array {
  const buffer = new Float32Array(resolution * resolution * 3); // x, y, z per vertex

  for (let j = 0; j < resolution; j++) {
    for (let i = 0; i < resolution; i++) {
      const lon = (i / (resolution - 1)) * 360 - 180;
      const lat = (j / (resolution - 1)) * 180 - 90;
      const depth = getTerrainDepth(lon, lat);

      const idx = (j * resolution + i) * 3;
      buffer[idx] = lon;
      buffer[idx + 1] = lat;
      buffer[idx + 2] = depth;
    }
  }

  return buffer;
}

/**
 * Generate terrain as indexed triangles for Three.js BufferGeometry
 */
export function generateTerrainMesh(
  resolution: number = 180
): { positions: Float32Array; colors: Float32Array; indices: Uint32Array } {
  const vertCount = resolution * resolution;
  const positions = new Float32Array(vertCount * 3);
  const colors = new Float32Array(vertCount * 3);

  for (let j = 0; j < resolution; j++) {
    for (let i = 0; i < resolution; i++) {
      const lon = (i / (resolution - 1)) * 360 - 180;
      const lat = (j / (resolution - 1)) * 180 - 90;
      const depth = getTerrainDepth(lon, lat);

      const idx = (j * resolution + i) * 3;

      // Convert to sphere coordinates
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + 180) * Math.PI) / 180;
      const radius = 50 + Math.max(depth, -10000) / 200; // scale depth

      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.cos(phi);
      positions[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Color based on depth
      const depthNorm = (depth + 10000) / 12000; // 0 = 10km deep, 1 = 2km high
      const [r, g, b] = depthToColor(depthNorm, depth);
      colors[idx] = r;
      colors[idx + 1] = g;
      colors[idx + 2] = b;
    }
  }

  // Generate triangle indices
  const triCount = (resolution - 1) * (resolution - 1) * 2;
  const indices = new Uint32Array(triCount * 3);
  let t = 0;

  for (let j = 0; j < resolution - 1; j++) {
    for (let i = 0; i < resolution - 1; i++) {
      const a = j * resolution + i;
      const b = a + 1;
      const c = a + resolution;
      const d = c + 1;

      indices[t++] = a;
      indices[t++] = c;
      indices[t++] = b;

      indices[t++] = b;
      indices[t++] = c;
      indices[t++] = d;
    }
  }

  return { positions, colors, indices };
}

/**
 * Map depth to color — ocean depth palette
 */
function depthToColor(norm: number, depth: number): [number, number, number] {
  if (depth > 0) {
    // Land — sandy/brown
    const t = Math.min(depth / 2000, 1);
    return [
      0.3 + t * 0.4,
      0.25 + t * 0.3,
      0.15 + t * 0.1
    ];
  }

  // Shallow shelf: 0-200m (cyan-blue)
  if (depth > -200) {
    return [0.1, 0.5 + norm * 0.3, 0.7 + norm * 0.2];
  }

  // Continental slope: 200-4000m
  if (depth > -4000) {
    const t = (-depth - 200) / 3800;
    return [
      0.02 + t * 0.05,
      0.15 + (1 - t) * 0.35,
      0.4 + (1 - t) * 0.4
    ];
  }

  // Deep ocean: 4000-6000m (dark blue-purple)
  if (depth > -6000) {
    const t = (-depth - 4000) / 2000;
    return [
      0.05 + t * 0.08,
      0.05 + (1 - t) * 0.1,
      0.25 + (1 - t) * 0.15
    ];
  }

  // Hadal zone: 6000m+ (dark purple-black)
  const t = Math.min((-depth - 6000) / 5000, 1);
  return [
    0.08 + t * 0.05,
    0.02 + (1 - t) * 0.03,
    0.15 + (1 - t) * 0.1
  ];
}
