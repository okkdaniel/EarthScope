/**
 * GLSL for the event marker point sprites.
 *
 * A single THREE.Points draws every marker in one draw call. Each point carries
 * per-vertex attributes (colour, visual id, animation phase, size, active flag)
 * and the fragment shader branches on the visual id to give each category a
 * distinct, subtle motion — never distracting (CLAUDE.md: Motion).
 */

export const markerVertexShader = /* glsl */ `
  attribute float aType;
  attribute float aPhase;
  attribute float aSize;
  attribute float aActive;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;

  varying vec3 vColor;
  varying float vType;
  varying float vPhase;
  varying float vActive;

  void main() {
    vColor = aColor;
    vType = aType;
    vPhase = aPhase;
    vActive = aActive;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Gentle breathing pulse; inactive (closed) events sit still and dimmer.
    float pulse = vActive > 0.5 ? 0.9 + 0.1 * sin(uTime * 2.0 + aPhase) : 1.0;

    gl_PointSize = aSize * uSizeScale * uPixelRatio * pulse * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const markerFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;

  varying vec3 vColor;
  varying float vType;
  varying float vPhase;
  varying float vActive;

  const float PI = 3.14159265359;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float angle = atan(uv.y, uv.x);
    float t = uTime + vPhase;

    // Soft glowing core shared by all categories.
    float core = smoothstep(0.5, 0.05, dist);
    float alpha = core * 0.9;

    // Per-category flourish.
    if (vType < 0.5) {
      // wildfire: flickering ember
      float flicker = 0.75 + 0.25 * sin(t * 9.0) * sin(t * 3.7 + 1.3);
      alpha *= flicker;
    } else if (vType < 1.5) {
      // volcano: slow bright throb
      alpha *= 0.7 + 0.3 * sin(t * 1.6);
    } else if (vType < 2.5) {
      // storm: rotating spiral arms
      float arms = 0.5 + 0.5 * sin(angle * 2.0 + t * 2.2 - dist * 10.0);
      alpha *= mix(0.55, 1.0, arms);
    } else if (vType < 3.5) {
      // flood: expanding ripple ring
      float ring = smoothstep(0.05, 0.0, abs(fract(dist * 2.0 - t * 0.5) - 0.5) - 0.15);
      alpha = max(alpha * 0.6, ring * core);
    } else if (vType < 4.5) {
      // sea ice: cool crisp outline
      float rim = smoothstep(0.5, 0.42, dist) - smoothstep(0.42, 0.34, dist);
      alpha = max(alpha * 0.5, rim);
    } else if (vType < 5.5) {
      // dust: drifting soft haze
      alpha *= 0.5 + 0.2 * sin(t * 1.2 + uv.x * 6.0);
    }

    // Additive-friendly premultiplied output.
    vec3 color = vColor * (0.6 + 0.6 * core);
    gl_FragColor = vec4(color, alpha * (vActive > 0.5 ? 1.0 : 0.5));
  }
`
