# Bathyx

An interactive 3D ocean floor atlas that visualizes the bathymetric terrain of Earth's oceans. Explore the Mariana Trench, Mid-Atlantic Ridge, Hawaiian seamounts, and hydrothermal vent fields in a real-time WebGL globe.

## How It Works

Bathyx renders Earth's ocean floor as a 3D sphere using procedural terrain generation. The globe combines fractal Brownian motion noise with geographically accurate feature placement to create a scientifically grounded visualization of ocean bathymetry.

### Terrain Generation

The ocean floor is modeled as a sphere with radius 50 units, where each vertex is displaced based on depth. The terrain uses:

- **Fractal Brownian Motion (FBM):** Six octaves of value noise with smoothstep interpolation produce natural-looking ocean floor topography. Each octave doubles the frequency and halves the amplitude, creating detail at multiple scales.
- **Continental shelf modeling:** A low-frequency noise layer determines land vs. ocean regions. Areas above a threshold are rendered as elevated terrain (positive depth), while below forms the ocean basins.
- **Geographic feature injection:** Real-world coordinates for trenches, ridges, seamounts, and vents are mapped onto the sphere. Proximity functions create smooth influence gradients around each feature, blending procedural noise with geographic accuracy.

### Bathymetric Features

**Trenches** — The deepest ocean features. Modeled as elongated depressions with influence radii of ~3° around:
- Mariana Trench (143°E, 12°N) — max depth ~11,000m
- Tonga Trench (174°W, 24°S) — max depth ~10,800m  
- Peru-Chile Trench (73°W, 20°S) — max depth ~8,000m

**Ridges** — Mid-ocean spreading centers rendered as elevated terrain:
- Mid-Atlantic Ridge (~35°W, N-S axis)
- East Pacific Rise (~112°W, N-S axis)

**Seamounts** — Isolated volcanic peaks rising from the ocean floor:
- Hawaiian hotspot chain (155.5°W, 19.8°N)

**Hydrothermal Vents** — Particle-based visualization of deep-sea vent fields along ridge systems.

### Rendering Pipeline

1. **Mesh generation:** A latitude-longitude grid (180×180 vertices) is mapped onto the sphere. Each vertex's radius is displaced by `50 + depth/200`, where depth comes from the FBM + feature system.

2. **Color mapping:** Depth is normalized and mapped through a five-zone color palette:
   - Shallow shelf (0 to −200m): cyan-blue
   - Continental slope (−200 to −4000m): medium blue
   - Deep ocean (−4000 to −6000m): dark blue-purple
   - Hadal zone (−6000m+): near-black purple
   - Land: sandy brown

3. **Custom shaders:** GLSL vertex and fragment shaders handle depth-based coloring, light direction, and atmospheric density effects. The vertex shader passes position and color data; the fragment shader applies lighting.

4. **Feature rendering:** Trenches and ridges are drawn as colored line geometry (Line2 with width). Seamounts are glowing markers. Vents are animated particle systems.

### Camera System

A planetarium-style orbit camera allows exploration:
- **Drag** to orbit (azimuth + altitude)
- **Scroll** to zoom (clamped between 510 and 2000 units)
- **Pinch** on touch devices
- **Auto-rotate** for idle viewing
- **Raycasting** detects cursor position on the sphere, computing lon/lat/depth in real-time

### Architecture

```
src/
├── routes/
│   ├── +page.svelte          # Main scene: Three.js setup, render loop, HUD
│   ├── +layout.svelte        # CSS import
│   └── +layout.ts            # SSR disabled, prerender enabled
├── lib/
│   ├── catalog/
│   │   ├── terrain.ts        # FBM noise, depth calculation, mesh generation
│   │   ├── data.ts           # Ocean feature catalog (trenches, ridges, etc.)
│   │   └── types.ts          # TypeScript interfaces
│   ├── renderer/
│   │   ├── TerrainRenderer.ts # ShaderMaterial + BufferGeometry for terrain
│   │   ├── GridRenderer.ts   # Lat/lon grid overlay
│   │   ├── FeatureRenderer.ts # Trench lines, ridge lines, seamount markers, vent particles
│   │   └── shaders.ts        # GLSL vertex/fragment shaders
│   ├── engine/
│   │   └── OceanControls.ts  # Orbit camera with flyTo animation
│   └── stores/
│       └── ocean.ts          # Svelte stores for UI state
```

### Key Design Decisions

**Procedural + geographic hybrid:** Pure noise looks unrealistic; pure real data requires massive datasets. The hybrid approach — noise for base terrain, geographic coordinates for features — achieves visual fidelity with zero external dependencies.

**Sphere rendering:** Ocean floors are mapped onto a sphere (not a flat plane) to match Earth's geometry. The radius formula `50 + depth/200` compresses the 11km depth range into visually distinguishable relief without distorting the sphere shape.

**WebGL shaders:** Custom shaders (rather than MeshStandardMaterial) give direct control over depth-based coloring and allow atmospheric effects without a post-processing pass.

**Zero SSR:** The app uses `ssr = false` because Three.js requires the DOM. `prerender = true` with `adapter-static` generates a static SPA that can be served from any CDN.
