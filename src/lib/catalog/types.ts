/**
 * Bathyx — Bathymetric data types
 */

export interface TerrainPoint {
  lon: number;       // longitude (-180 to 180)
  lat: number;       // latitude (-90 to 90)
  depth: number;     // depth in meters (negative = below sea level)
  feature?: string;  // optional feature classification
}

export interface OceanTrench {
  id: string;
  name: string;
  region: string;
  maxDepth: number;      // meters
  coordinates: [number, number][]; // [lon, lat] pairs defining the trench path
  length: number;        // km
  description: string;
}

export interface Seamount {
  id: string;
  name: string;
  lon: number;
  lat: number;
  height: number;       // height from ocean floor in meters
  summitDepth: number;  // depth of summit below sea level
  type: 'guyot' | 'shield' | 'volcanic' | 'coral';
  description: string;
}

export interface HydrothermalVent {
  id: string;
  name: string;
  lon: number;
  lat: number;
  depth: number;
  temperature: number;  // max temp in °C
  type: 'black-smoker' | 'white-smoker' | 'warm-seep' | 'lava-flow';
  discovered: number;   // year
  description: string;
}

export interface OceanRidge {
  id: string;
  name: string;
  coordinates: [number, number][];
  length: number;        // km
  spreadingRate: number; // mm/year
  description: string;
}

export interface OceanFeature {
  trenches: OceanTrench[];
  seamounts: Seamount[];
  vents: HydrothermalVent[];
  ridges: OceanRidge[];
}

export type DepthColorMode = 'depth' | 'gradient' | 'thermal' | 'plate';
