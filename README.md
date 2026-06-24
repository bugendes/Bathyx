# 🌊 Bathyx

An interactive, GPU-accelerated ocean floor atlas that renders Earth's bathymetric terrain in real time. Built with SvelteKit, Three.js, and custom GLSL shaders.

## Overview

Bathyx places you at the center of a 3D globe and lets you explore the ocean floor — from continental shelves to abyssal trenches, mid-ocean ridges to hydrothermal vents. Drag to rotate, scroll to zoom, and click on any feature to learn more.

The terrain is procedurally generated using fractal Brownian motion noise, calibrated against real-world bathymetric data (GEBCO-derived depth profiles). Ocean features — 10 major trenches, 5 ridges, 8 seamounts, and 10 hydrothermal vent fields — are placed at their real geographic coordinates.

## Features

- **Procedural bathymetric terrain** — fractal noise terrain generation with realistic depth profiles (continental shelf → slope → abyssal plain → hadal zone)
- **10 oceanic trenches** — Mariana, Tonga, Philippine, Kermadec, Japan, Puerto Rico, Sunda, Peru-Chile, Aleutian, South Sandwich (real coordinates and depths)
- **5 mid-ocean ridges** — Mid-Atlantic Ridge, East Pacific Rise, Pacific-Antarctic, Central Indian, Gakkel Ridge with spreading rates
- **8 seamounts** — Mauna Kea, Seine Guyot, Great Meteor, Emperor chain, and more with type classification (guyot/shield/volcanic/coral)
- **10 hydrothermal vent fields** — Black smokers, white smokers, warm seeps, lava-flow vents with particle effects and real temperatures
- **Custom GLSL shaders** — depth-based color interpolation, bioluminescence shimmer, atmospheric fog, diffuse lighting
- **Interactive vent particles** — GPU point sprites with additive blending, animated along surface normals
- **Lat/lon grid overlay** — toggleable great-circle grid at 30° intervals
- **Feature selection** — click any trench, ridge, seamount, or vent to see detailed info
- **Layer controls** — toggle visibility of grid, trenches, ridges, seamounts, and vents independently
- **Auto-rotate** — smooth idle rotation animation
- **Planetarium camera** — origin-locked perspective with azimuth/altitude drag, scroll zoom, and pinch-zoom on mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit + TypeScript |
| Rendering | Three.js (WebGL2, custom ShaderMaterial) |
| Shaders | GLSL ES 3.0 (vertex + fragment) |
| Build | Vite + @sveltejs/adapter-static |
| Terrain | Procedural FBM noise with real bathymetric calibration |
| Features | Real geographic coordinates (NOAA/GEBCO-derived) |

## Project Structure

```
src/
├── lib/
│   ├── astronomy/
│   │   └── coordinates.ts      # lon/lat ↔ 3D vector, haversine, path interpolation
│   ├── catalog/
│   │   ├── types.ts            # OceanTrench, Seamount, HydrothermalVent, OceanRidge
│   │   ├── data.ts             # Real ocean feature catalog (10 trenches, 5 ridges, ...)
│   │   └── terrain.ts          # FBM noise terrain generator with depth profiles
│   ├── engine/
│   │   └── OceanControls.ts    # Planetarium camera (drag, zoom, pinch, flyTo)
│   ├── renderer/
│   │   ├── TerrainRenderer.ts   # THREE.Mesh + custom ShaderMaterial for terrain
│   │   ├── FeatureRenderer.ts   # Trench/ridge/seamount/vent overlay rendering
│   │   ├── GridRenderer.ts      # Lat/lon grid line overlay
│   │   └── shaders.ts          # GLSL vertex/fragment shaders
│   └── stores/
│       └── ocean.ts            # Svelte reactive state (layers, cursor, selection)
├── routes/
│   ├── +page.svelte            # Main canvas + HUD overlay + controls
│   ├── +layout.svelte          # App shell
│   └── +layout.ts              # SSR/prerender config
└── app.html                    # HTML template
```

## Terrain Generation

Ocean floor depth is computed procedurally at each (lon, lat) point using:

1. **Base noise** — FBM (6 octaves) for continental shelf and abyssal plain topology
2. **Ridge influence** — Gaussian proximity falloff near mid-ocean ridge axes (elevated +2000m)
3. **Trench influence** — Gaussian proximity falloff near trench paths (deepened -5000m)
4. **Seamount influence** — Gaussian bump at seamount locations (elevated +4000m)
5. **Fine detail** — 3-octave FBM at higher frequency (±500m perturbation)

The terrain mesh is generated as indexed triangles on a 180×180 grid, converted to spherical coordinates (radius from center encodes depth).

## Shader Pipeline

**Vertex shader:**
- Transforms terrain vertices through model-view-projection matrix
- Applies subtle wave displacement for shallow areas (sin/cos oscillation)
- Passes depth, color, normal, and position to fragment shader

**Fragment shader:**
- Depth-based color palette (cyan shelf → blue slope → dark purple abyss)
- Simple diffuse lighting from a directional light source
- Bioluminescence shimmer effect in deep areas (sin-wave glow modulation)
- Distance-based atmosphere fade near sphere edges

## Ocean Features

### Trenches (10)
| Name | Max Depth | Length | Region |
|------|-----------|--------|--------|
| Mariana | 10,994m | 2,550 km | Pacific |
| Tonga | 10,823m | 860 km | Pacific |
| Philippine | 10,540m | 1,320 km | Pacific |
| Kermadec | 10,047m | 1,000 km | Pacific |
| Japan | 9,000m | 800 km | Pacific |
| Puerto Rico | 8,376m | 800 km | Atlantic |
| Sunda | 7,725m | 3,200 km | Indian |
| Peru-Chile | 8,065m | 5,900 km | Pacific |
| Aleutian | 7,679m | 3,400 km | Pacific |
| South Sandwich | 8,264m | 965 km | Atlantic |

### Hydrothermal Vents (10)
| Name | Depth | Temp | Type |
|------|-------|------|------|
| 13°N Hydrothermal Field | 2,500m | 380°C | Black smoker |
| Lost City | 750m | 91°C | Warm seep |
| Rainbow Vent Field | 2,300m | 365°C | Black smoker |
| TAG Hydrothermal Field | 3,670m | 363°C | Black smoker |
| PACMANUS Vent Field | 1,700m | 350°C | Black smoker |
| East Pacific Rise 21°S | 2,600m | 355°C | Black smoker |
| Ashadze Vent Field | 4,080m | 305°C | Black smoker |
| Lau Basin Vents | 1,750m | 360°C | Black smoker |
| Brothers Volcano | 1,850m | 302°C | Black smoker |
| Pele's Vents | 1,550m | 310°C | Lava-flow |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5174

## Build

```bash
npm run build
npm run preview
```

## Roadmap

- [ ] Real GEBCO/ETOPO bathymetric grid data (30 arc-second resolution)
- [ ] Plate boundary visualization (convergent/divergent/transform)
- [ ] Ocean current particle flow simulation
- [ ] Mariana Challenger Deep submersible dive path
- [ ] Seafloor sediment type classification overlay
- [ ] Earthquake/seismicity real-time feed (USGS API)
- [ ] Mobile touch gesture refinements
- [ ] Depth-of-field camera effects
- [ ] Biome-based coloring (abyssal plain, continental shelf, reef)

## License

MIT © 2026 Tirta Dhila
