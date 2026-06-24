/**
 * Bathyx — GLSL Shaders
 * Custom vertex and fragment shaders for ocean floor rendering
 */

// Terrain vertex shader — transforms terrain mesh with depth-based displacement
export const terrainVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec3 color;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uDepthScale;

  varying vec3 vColor;
  varying float vDepth;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vColor = color;
    vDepth = position.y; // depth component

    // Subtle ocean current animation for shallow areas
    float wave = sin(position.x * 0.01 + uTime * 0.5) * cos(position.z * 0.01 + uTime * 0.3);
    float shallowFactor = smoothstep(-500.0, 0.0, position.y);
    vec3 displaced = position + vec3(0.0, wave * 2.0 * shallowFactor, 0.0);

    vPosition = displaced;
    vNormal = normalize(position); // spherical normal

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

// Terrain fragment shader — depth coloring with atmospheric effects
export const terrainFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vDepth;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float uTime;
  uniform vec3 uLightDir;
  uniform float uAtmosphereDensity;

  void main() {
    // Base color from vertex data
    vec3 baseColor = vColor;

    // Simple diffuse lighting
    float diff = max(dot(vNormal, normalize(uLightDir)), 0.0);
    float ambient = 0.3;
    float lighting = ambient + diff * 0.7;

    // Depth-based fog (darker in deep areas)
    float depthFog = smoothstep(-8000.0, -1000.0, vDepth);
    vec3 deepColor = vec3(0.02, 0.01, 0.08);
    vec3 shallowColor = baseColor * lighting;
    vec3 finalColor = mix(deepColor, shallowColor, depthFog);

    // Subtle bioluminescence shimmer in deep areas
    float bioGlow = sin(vPosition.x * 0.05 + uTime * 2.0) *
                    sin(vPosition.z * 0.05 + uTime * 1.5) *
                    sin(vPosition.y * 0.03 + uTime * 0.8);
    float deepGlow = smoothstep(-6000.0, -9000.0, vDepth) * 0.3;
    finalColor += vec3(0.0, 0.3, 0.5) * bioGlow * deepGlow;

    // Distance-based atmosphere fade
    float dist = length(vPosition);
    float atmFade = smoothstep(600.0, 300.0, dist);
    finalColor = mix(finalColor, vec3(0.02, 0.05, 0.15), atmFade * uAtmosphereDensity);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Particle vertex shader — for hydrothermal vent particles
export const particleVertexShader = /* glsl */ `
  precision highp float;

  attribute float size;
  attribute float life;
  attribute vec3 velocity;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vLife;
  varying float vSize;

  void main() {
    vLife = life;
    vSize = size;

    // Animate particles upward
    vec3 pos = position + velocity * mod(uTime * 0.5, life);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Particle fragment shader — glowing thermal particles
export const particleFragmentShader = /* glsl */ `
  precision highp float;

  varying float vLife;
  varying float vSize;

  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    // Circular particle shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = smoothstep(0.5, 0.0, dist) * uOpacity;

    // Fade with life
    alpha *= smoothstep(0.0, 0.2, vLife) * smoothstep(1.0, 0.8, vLife);

    // Hot center
    vec3 color = mix(uColor, vec3(1.0), smoothstep(0.2, 0.0, dist));

    gl_FragColor = vec4(color, alpha);
  }
`;

// Grid/overlay vertex shader
export const overlayVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute float alpha;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  varying float vAlpha;

  void main() {
    vAlpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Grid/overlay fragment shader
export const overlayFragmentShader = /* glsl */ `
  precision highp float;

  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * 0.4);
  }
`;

// Caustic effect fragment shader (for surface overlay)
export const causticFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // Simple caustic pattern
  float caustic(vec2 uv, float time) {
    float c = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 p = uv * (3.0 + fi) + time * (0.5 + fi * 0.3);
      c += sin(p.x + sin(p.y + time * 0.4)) * 0.25;
    }
    return c * 0.33;
  }

  void main() {
    vec2 uv = vUv;
    float c = caustic(uv, uTime);
    vec3 color = vec3(0.0, 0.15, 0.3) * (0.5 + c);
    gl_FragColor = vec4(color, 0.15);
  }
`;
