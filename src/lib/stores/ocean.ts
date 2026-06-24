/**
 * Bathyx — Svelte Stores
 * Reactive state for the ocean atlas
 */
import { writable, derived } from 'svelte/store';

export const cursorLon = writable(0);
export const cursorLat = writable(0);
export const cursorDepth = writable(-3500);

export const showGrid = writable(true);
export const showTrenches = writable(true);
export const showRidges = writable(true);
export const showSeamounts = writable(true);
export const showVents = writable(true);

export const selectedFeature = writable<{
  type: string;
  name: string;
  data: Record<string, unknown>;
} | null>(null);

export const isAnimating = writable(false);
export const autoRotate = writable(false);

export const depthColorMode = writable<'depth' | 'gradient' | 'thermal' | 'plate'>('depth');

// Derived: formatted cursor position
export const cursorInfo = derived(
  [cursorLon, cursorLat, cursorDepth],
  ([$lon, $lat, $depth]) => {
    const latDir = $lat >= 0 ? 'N' : 'S';
    const lonDir = $lon >= 0 ? 'E' : 'W';
    const coords = `${Math.abs($lat).toFixed(2)}°${latDir} ${Math.abs($lon).toFixed(2)}°${lonDir}`;

    const depthStr = $depth >= 0
      ? `${Math.round($depth)}m elev.`
      : `${Math.abs(Math.round($depth)).toLocaleString()}m depth`;

    return { coords, depth: depthStr, lon: $lon, lat: $lat, depthValue: $depth };
  }
);
