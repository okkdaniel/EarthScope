/**
 * GLSL for the event marker point sprites.
 *
 * A single THREE.Points draws every marker in one call. On the warm paper
 * globe the markers read as precise annotation dots — a filled category-colour
 * disc with a slightly darker rim for definition and a soft edge. Active events
 * breathe gently; closed ones sit still and quieter. Normal (not additive)
 * blending keeps colours true on the light canvas.
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
  varying float vActive;

  void main() {
    vColor = aColor;
    vActive = aActive;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Gentle breathing for active events; closed events are static.
    float pulse = vActive > 0.5 ? 0.92 + 0.08 * sin(uTime * 1.8 + aPhase) : 1.0;

    gl_PointSize = aSize * uSizeScale * uPixelRatio * pulse * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const markerFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vActive;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Filled disc with a soft edge (fixed width — avoids derivative extensions).
    float fill = smoothstep(0.5, 0.44, dist);

    // A slightly darker rim gives the dot definition on the light globe.
    float rim = smoothstep(0.5, 0.42, dist) - smoothstep(0.42, 0.30, dist);
    vec3 color = mix(vColor, vColor * 0.7, rim * 0.6);

    float alpha = fill * (vActive > 0.5 ? 1.0 : 0.6);
    gl_FragColor = vec4(color, alpha);
  }
`
