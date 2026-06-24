/**
 * Bathyx — Grid Overlay Renderer
 * Latitude/longitude grid lines rendered as great circles
 */
import * as THREE from 'three';
import { lonLatToVector } from '../astronomy/coordinates';
import { overlayVertexShader, overlayFragmentShader } from './shaders';

const BASE_RADIUS = 501; // slightly above terrain

export class GridRenderer {
  private group: THREE.Group;
  private material: THREE.ShaderMaterial;
  private visible: boolean = true;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'grid';

    this.material = new THREE.ShaderMaterial({
      vertexShader: overlayVertexShader,
      fragmentShader: overlayFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Vector3(0.2, 0.5, 0.7) }
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.buildGrid();
  }

  private buildGrid() {
    // Latitude lines every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      this.addLatitudeLine(lat, lat === 0 ? 1.0 : 0.5);
    }

    // Longitude lines every 30°
    for (let lon = -180; lon < 180; lon += 30) {
      this.addLongitudeLine(lon, lon === 0 ? 1.0 : 0.5);
    }
  }

  private addLatitudeLine(lat: number, alpha: number) {
    const segments = 120;
    const positions = new Float32Array(segments * 3);
    const alphas = new Float32Array(segments);

    for (let i = 0; i < segments; i++) {
      const lon = (i / (segments - 1)) * 360 - 180;
      const [x, y, z] = lonLatToVector(lon, lat, BASE_RADIUS);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      alphas[i] = alpha;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const line = new THREE.Line(geometry, this.material);
    this.group.add(line);
  }

  private addLongitudeLine(lon: number, alpha: number) {
    const segments = 90;
    const positions = new Float32Array(segments * 3);
    const alphas = new Float32Array(segments);

    for (let i = 0; i < segments; i++) {
      const lat = (i / (segments - 1)) * 180 - 90;
      const [x, y, z] = lonLatToVector(lon, lat, BASE_RADIUS);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      alphas[i] = alpha;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const line = new THREE.Line(geometry, this.material);
    this.group.add(line);
  }

  getObject(): THREE.Group {
    return this.group;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.group.visible = visible;
  }

  toggle() {
    this.setVisible(!this.visible);
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
    });
    this.material.dispose();
  }
}
