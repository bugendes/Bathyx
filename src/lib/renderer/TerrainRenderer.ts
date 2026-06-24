/**
 * Bathyx — Terrain Renderer
 * Renders the bathymetric ocean floor as a 3D sphere
 */
import * as THREE from 'three';
import { generateTerrainMesh } from '../catalog/terrain';
import { terrainVertexShader, terrainFragmentShader } from './shaders';

export class TerrainRenderer {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  private time: number = 0;

  constructor(resolution: number = 180) {
    const { positions, colors, indices } = generateTerrainMesh(resolution);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    this.material = new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDepthScale: { value: 0.02 },
        uLightDir: { value: new THREE.Vector3(1, 0.5, 0.5).normalize() },
        uAtmosphereDensity: { value: 0.0 }
      },
      side: THREE.DoubleSide,
      transparent: false
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  update(dt: number) {
    this.time += dt;
    this.material.uniforms.uTime.value = this.time;
  }

  setLightDirection(dir: THREE.Vector3) {
    this.material.uniforms.uLightDir.value.copy(dir).normalize();
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
