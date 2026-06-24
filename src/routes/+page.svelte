<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { TerrainRenderer } from '$lib/renderer/TerrainRenderer';
  import { GridRenderer } from '$lib/renderer/GridRenderer';
  import {
    createTrenchLines,
    createRidgeLines,
    createSeamountMarkers,
    createVentParticles,
    updateFeatures
  } from '$lib/renderer/FeatureRenderer';
  import { OceanCamera } from '$lib/engine/OceanControls';
  import { oceanFeatures } from '$lib/catalog/data';
  import { getTerrainDepth } from '$lib/catalog/terrain';
  import {
    showGrid, showTrenches, showRidges, showSeamounts, showVents,
    selectedFeature, autoRotate as autoRotateStore,
    cursorLon, cursorLat, cursorDepth, cursorInfo
  } from '$lib/stores/ocean';
  import { get } from 'svelte/store';

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: OceanCamera;

  let terrain: TerrainRenderer;
  let grid: GridRenderer;
  let trenchGroup: THREE.Group;
  let ridgeGroup: THREE.Group;
  let seamountGroup: THREE.Group;
  let ventGroup: THREE.Group;
  let featureGroup: THREE.Group;

  let raycaster: THREE.Raycaster;
  let pointer: THREE.Vector2;

  let animationId: number;
  let clock: THREE.Clock;
  let elapsed = 0;

  let featureInfoVisible = false;
  let infoPanel: {
    type: string;
    name: string;
    description: string;
    details: string[];
  } | null = null;

  // Store subscriptions — update local vars for template
  let gridOn = true;
  let trenchesOn = true;
  let ridgesOn = true;
  let seamountsOn = true;
  let ventsOn = true;
  let autoRot = false;
  let cursorCoords = '';
  let cursorDepthStr = '';

  let unsub: (() => void)[] = [];

  onMount(() => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    camera = new OceanCamera(container.clientWidth / container.clientHeight);
    camera.attach(container);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    clock = new THREE.Clock();

    terrain = new TerrainRenderer(180);
    scene.add(terrain.mesh);

    grid = new GridRenderer();
    scene.add(grid.getObject());

    featureGroup = new THREE.Group();
    featureGroup.name = 'features';

    trenchGroup = createTrenchLines(oceanFeatures.trenches);
    ridgeGroup = createRidgeLines(oceanFeatures.ridges);
    seamountGroup = createSeamountMarkers(oceanFeatures.seamounts);
    ventGroup = createVentParticles(oceanFeatures.vents);

    featureGroup.add(trenchGroup);
    featureGroup.add(ridgeGroup);
    featureGroup.add(seamountGroup);
    featureGroup.add(ventGroup);
    scene.add(featureGroup);

    const ambient = new THREE.AmbientLight(0x202040, 0.5);
    scene.add(ambient);

    // Store subscriptions
    unsub.push(showGrid.subscribe(v => { gridOn = v; grid?.setVisible(v); }));
    unsub.push(showTrenches.subscribe(v => { trenchesOn = v; if (trenchGroup) trenchGroup.visible = v; }));
    unsub.push(showRidges.subscribe(v => { ridgesOn = v; if (ridgeGroup) ridgeGroup.visible = v; }));
    unsub.push(showSeamounts.subscribe(v => { seamountsOn = v; if (seamountGroup) seamountGroup.visible = v; }));
    unsub.push(showVents.subscribe(v => { ventsOn = v; if (ventGroup) ventGroup.visible = v; }));
    unsub.push(autoRotateStore.subscribe(v => { autoRot = v; }));
    unsub.push(cursorInfo.subscribe(info => {
      cursorCoords = info.coords;
      cursorDepthStr = info.depth;
    }));

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    animate();
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    unsub.forEach(fn => fn());
    container?.removeEventListener('pointermove', onPointerMove);
    container?.removeEventListener('click', onClick);
    terrain?.dispose();
    grid?.dispose();
    renderer?.dispose();
  });

  function onResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.updateAspect(w / h);
  }

  function onPointerMove(e: MouseEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera.camera);
    const intersects = raycaster.intersectObject(terrain.mesh);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normal = point.clone().normalize();
      const lat = 90 - Math.acos(normal.y) * (180 / Math.PI);
      const lon = Math.atan2(normal.z, normal.x) * (180 / Math.PI);
      const depth = getTerrainDepth(lon, lat);
      cursorLon.set(lon);
      cursorLat.set(lat);
      cursorDepth.set(depth);
    }
  }

  function onClick(e: MouseEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera.camera);

    const featureObjects: THREE.Object3D[] = [];
    featureGroup.traverse(obj => { if (obj.userData?.type) featureObjects.push(obj); });
    const intersects = raycaster.intersectObjects(featureObjects);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData.data;
      const type = hit.userData.type;

      selectedFeature.set({ type, name: data.name, data });
      infoPanel = {
        type,
        name: data.name,
        description: data.description,
        details: getFeatureDetails(type, data)
      };
      featureInfoVisible = true;
    } else {
      featureInfoVisible = false;
      selectedFeature.set(null);
      infoPanel = null;
    }
  }

  function getFeatureDetails(type: string, data: Record<string, unknown>): string[] {
    switch (type) {
      case 'trench':
        return [`Max depth: ${Number(data.maxDepth).toLocaleString()}m`, `Length: ${data.length} km`, `Region: ${data.region}`];
      case 'ridge':
        return [`Length: ${Number(data.length).toLocaleString()} km`, `Spreading rate: ${data.spreadingRate} mm/yr`];
      case 'seamount':
        return [`Height: ${Number(data.height).toLocaleString()}m`, `Summit depth: ${data.summitDepth}m`, `Type: ${data.type}`];
      case 'vent':
        return [`Depth: ${Number(data.depth).toLocaleString()}m`, `Temperature: ${data.temperature}°C`, `Type: ${data.type}`, `Discovered: ${data.discovered}`];
      default:
        return [];
    }
  }

  function closeInfo() {
    featureInfoVisible = false;
    infoPanel = null;
    selectedFeature.set(null);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    elapsed += dt;
    terrain.update(dt);
    updateFeatures(featureGroup, dt, elapsed);
    if (get(autoRotateStore)) camera.autoRotate(0.05);
    renderer.render(scene, camera.camera);
  }

  function toggleGrid() { showGrid.update(v => !v); }
  function toggleTrenches() { showTrenches.update(v => !v); }
  function toggleRidges() { showRidges.update(v => !v); }
  function toggleSeamounts() { showSeamounts.update(v => !v); }
  function toggleVents() { showVents.update(v => !v); }
  function toggleAutoRotate() { autoRotateStore.update(v => !v); }
</script>

<div class="ocean-app" bind:this={container}>
  <canvas bind:this={canvas}></canvas>

  <div class="hud-brand">
    <h1>🌊 Bathyx</h1>
    <p>Interactive Ocean Floor Atlas</p>
  </div>

  <div class="hud-cursor">
    <span class="coords">{cursorCoords}</span>
    <span class="depth">{cursorDepthStr}</span>
  </div>

  {#if featureInfoVisible && infoPanel}
    <div class="info-panel">
      <button class="close-btn" on:click={closeInfo}>×</button>
      <div class="info-type {infoPanel.type}">{infoPanel.type}</div>
      <h2>{infoPanel.name}</h2>
      <p>{infoPanel.description}</p>
      <ul>
        {#each infoPanel.details as detail}
          <li>{detail}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="hud-controls">
    <button class="toggle" class:active={gridOn} on:click={toggleGrid}>Grid</button>
    <button class="toggle" class:active={trenchesOn} on:click={toggleTrenches}>Trenches</button>
    <button class="toggle" class:active={ridgesOn} on:click={toggleRidges}>Ridges</button>
    <button class="toggle" class:active={seamountsOn} on:click={toggleSeamounts}>Seamounts</button>
    <button class="toggle" class:active={ventsOn} on:click={toggleVents}>Vents</button>
    <button class="toggle" class:active={autoRot} on:click={toggleAutoRotate}>↻ Auto</button>
  </div>

  <div class="hud-legend">
    <div class="legend-item"><span class="dot" style="background:#8b5cf6"></span> Trench</div>
    <div class="legend-item"><span class="dot" style="background:#10b981"></span> Ridge</div>
    <div class="legend-item"><span class="dot" style="background:#3b82f6"></span> Seamount</div>
    <div class="legend-item"><span class="dot" style="background:#f97316"></span> Vent</div>
  </div>

  <div class="depth-scale">
    <div class="scale-bar"></div>
    <div class="scale-labels">
      <span>0m</span>
      <span>-2000m</span>
      <span>-4000m</span>
      <span>-6000m</span>
      <span>-8000m</span>
      <span>-10000m</span>
    </div>
  </div>
</div>

<style>
  .ocean-app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hud-brand, .hud-cursor, .hud-controls, .hud-legend, .info-panel, .depth-scale {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .hud-controls button, .info-panel button, .close-btn {
    pointer-events: auto;
  }

  .hud-brand {
    top: 20px;
    left: 24px;
    color: var(--text-primary);
  }
  .hud-brand h1 {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .hud-brand p {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 2px 0 0;
  }

  .hud-cursor {
    bottom: 20px;
    left: 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
  .hud-cursor .coords { color: var(--accent-cyan); }
  .hud-cursor .depth { color: var(--accent-teal); }

  .hud-controls {
    bottom: 20px;
    right: 24px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 360px;
  }
  .toggle {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }
  .toggle:hover {
    border-color: var(--accent-cyan);
    color: var(--text-primary);
  }
  .toggle.active {
    background: rgba(6, 182, 212, 0.15);
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .hud-legend {
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 16px;
    background: rgba(17, 24, 39, 0.7);
    padding: 6px 16px;
    border-radius: 8px;
    backdrop-filter: blur(8px);
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.65rem;
    color: var(--text-secondary);
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .info-panel {
    top: 20px;
    right: 24px;
    width: 280px;
    background: rgba(17, 24, 39, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 12px;
    padding: 16px;
    backdrop-filter: blur(12px);
    pointer-events: auto;
    color: var(--text-primary);
  }
  .close-btn {
    position: absolute;
    top: 8px;
    right: 10px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
  }
  .info-type {
    display: inline-block;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 6px;
  }
  .info-type.trench { background: rgba(139,92,246,0.2); color: #a78bfa; }
  .info-type.ridge { background: rgba(16,185,129,0.2); color: #34d399; }
  .info-type.seamount { background: rgba(59,130,246,0.2); color: #60a5fa; }
  .info-type.vent { background: rgba(249,115,22,0.2); color: #fb923c; }
  .info-panel h2 { font-size: 1rem; font-weight: 600; margin: 0 0 6px; }
  .info-panel p { font-size: 0.75rem; color: var(--text-secondary); margin: 0 0 8px; line-height: 1.4; }
  .info-panel ul { list-style: none; padding: 0; margin: 0; font-size: 0.7rem; color: var(--text-secondary); }
  .info-panel li { padding: 2px 0; border-bottom: 1px solid rgba(148,163,184,0.08); }
  .info-panel li:last-child { border-bottom: none; }

  .depth-scale {
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    display: flex;
    gap: 4px;
    align-items: stretch;
    height: 200px;
  }
  .scale-bar {
    width: 6px;
    border-radius: 3px;
    background: linear-gradient(to bottom, #3b82f6 0%, #1e40af 30%, #1e3a5f 50%, #1e1b4b 70%, #0c0a09 100%);
  }
  .scale-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.55rem;
    color: var(--text-secondary);
    font-family: monospace;
  }
</style>
