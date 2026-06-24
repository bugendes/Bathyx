/**
 * Bathyx — index.ts
 * Barrel exports for the library
 */
export { TerrainRenderer } from './renderer/TerrainRenderer';
export { GridRenderer } from './renderer/GridRenderer';
export { OceanCamera } from './engine/OceanControls';
export { oceanFeatures } from './catalog/data';
export { getTerrainDepth } from './catalog/terrain';
export { lonLatToVector, formatDepth, formatCoords, haversineDistance } from './astronomy/coordinates';
export * from './stores/ocean';
export type * from './catalog/types';
