/**
 * Bathyx — Feature Renderers
 * Render ocean features (trenches, ridges, seamounts, vents) as overlays
 */
import * as THREE from 'three';
import type { OceanTrench, Seamount, HydrothermalVent, OceanRidge } from '../catalog/types';
import { lonLatToVector, interpolatePath } from '../astronomy/coordinates';
import {
  particleVertexShader,
  particleFragmentShader
} from './shaders';

const BASE_RADIUS = 500;
const DEPTH_SCALE = 0.02;
const FEATURE_OFFSET = 0.5; // slight offset above terrain to prevent z-fighting

/**
 * Convert lon/lat/depth to world position
 */
function toWorld(lon: number, lat: number, depth: number): THREE.Vector3 {
  const r = BASE_RADIUS + depth * DEPTH_SCALE + FEATURE_OFFSET;
  const [x, y, z] = lonLatToVector(lon, lat, r);
  return new THREE.Vector3(x, y, z);
}

/**
 * Create trench line overlays
 */
export function createTrenchLines(trenches: OceanTrench[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'trenches';

  const material = new THREE.LineBasicMaterial({
    color: 0x8b5cf6, // purple
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });

  for (const trench of trenches) {
    const points = interpolatePath(trench.coordinates, 50);
    const vertices: THREE.Vector3[] = [];

    for (const [lon, lat] of points) {
      vertices.push(toWorld(lon, lat, trench.maxDepth));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const line = new THREE.Line(geometry, material);
    line.name = `trench-${trench.id}`;
    line.userData = { type: 'trench', data: trench };
    group.add(line);
  }

  return group;
}

/**
 * Create ridge line overlays
 */
export function createRidgeLines(ridges: OceanRidge[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ridges';

  const material = new THREE.LineBasicMaterial({
    color: 0x10b981, // emerald
    linewidth: 2,
    transparent: true,
    opacity: 0.7
  });

  for (const ridge of ridges) {
    const points = interpolatePath(ridge.coordinates, 80);
    const vertices: THREE.Vector3[] = [];

    for (const [lon, lat] of points) {
      vertices.push(toWorld(lon, lat, -2500)); // typical ridge depth
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const line = new THREE.Line(geometry, material);
    line.name = `ridge-${ridge.id}`;
    line.userData = { type: 'ridge', data: ridge };
    group.add(line);
  }

  return group;
}

/**
 * Create seamount markers
 */
export function createSeamountMarkers(seamounts: Seamount[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'seamounts';

  const markerGeo = new THREE.ConeGeometry(2, 8, 6);

  for (const mount of seamounts) {
    const colorMap: Record<string, number> = {
      guyot: 0x3b82f6,
      shield: 0x10b981,
      volcanic: 0xf97316,
      coral: 0xec4899
    };

    const material = new THREE.MeshBasicMaterial({
      color: colorMap[mount.type] || 0x3b82f6,
      transparent: true,
      opacity: 0.9
    });

    const marker = new THREE.Mesh(markerGeo, material);
    const pos = toWorld(mount.lon, mount.lat, mount.summitDepth);
    marker.position.copy(pos);

    // Orient cone to point away from center
    marker.lookAt(0, 0, 0);
    marker.rotateX(Math.PI / 2);

    marker.name = `seamount-${mount.id}`;
    marker.userData = { type: 'seamount', data: mount };
    group.add(marker);
  }

  return group;
}

/**
 * Create hydrothermal vent particle systems
 */
export function createVentParticles(vents: HydrothermalVent[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vents';

  for (const vent of vents) {
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const ventPos = toWorld(vent.lon, vent.lat, vent.depth);
    const normal = ventPos.clone().normalize();

    for (let i = 0; i < particleCount; i++) {
      // Random offset from vent center
      const spread = 1.5;
      positions[i * 3] = ventPos.x + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = ventPos.y + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = ventPos.z + (Math.random() - 0.5) * spread;

      sizes[i] = 1 + Math.random() * 2;
      lifes[i] = Math.random();

      // Velocity along surface normal (upward from vent)
      const speed = 2 + Math.random() * 3;
      velocities[i * 3] = normal.x * speed;
      velocities[i * 3 + 1] = normal.y * speed;
      velocities[i * 3 + 2] = normal.z * speed;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('life', new THREE.BufferAttribute(lifes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // Color based on vent type
    const colorMap: Record<string, THREE.Color> = {
      'black-smoker': new THREE.Color(0.3, 0.3, 0.3),
      'white-smoker': new THREE.Color(0.9, 0.9, 0.9),
      'warm-seep': new THREE.Color(0.2, 0.8, 0.4),
      'lava-flow': new THREE.Color(1.0, 0.3, 0.0)
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: window.devicePixelRatio },
        uColor: { value: colorMap[vent.type] || new THREE.Color(1, 0.5, 0) },
        uOpacity: { value: 0.6 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    points.name = `vent-${vent.id}`;
    points.userData = { type: 'vent', data: vent, material };
    group.add(points);

    // Vent marker (small sphere at base)
    const markerGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({
      color: vent.type === 'black-smoker' ? 0xff4500 : 0x00ff88,
      transparent: true,
      opacity: 0.8
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(ventPos);
    marker.name = `vent-marker-${vent.id}`;
    marker.userData = { type: 'vent', data: vent };
    group.add(marker);
  }

  return group;
}

/**
 * Update animated features (vent particles)
 */
export function updateFeatures(group: THREE.Group, dt: number, time: number) {
  group.traverse((child) => {
    if (child.userData?.type === 'vent' && child instanceof THREE.Points) {
      const material = child.userData.material;
      if (material?.uniforms?.uTime) {
        material.uniforms.uTime.value = time;
      }

      // Update particle lifetimes
      const lifeAttr = child.geometry.getAttribute('life') as THREE.BufferAttribute;
      for (let i = 0; i < lifeAttr.count; i++) {
        let life = lifeAttr.getX(i) + dt * 0.3;
        if (life > 1) life = 0;
        lifeAttr.setX(i, life);
      }
      lifeAttr.needsUpdate = true;
    }
  });
}
