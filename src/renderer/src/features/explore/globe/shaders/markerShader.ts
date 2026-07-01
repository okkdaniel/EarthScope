/**
 * GLSL for the event marker point sprites.
 *
 * A single THREE.Points draws every marker in one call. On the white survey
 * globe each event reads as a precise annotation mark: a category-colour dot
 * inside a thin ink ring (active), or a hollow ink ring (closed) — the same
 * ink-and-line vocabulary as the coastlines.
 *
 * Crucially, markers on the far side of the globe are culled in the vertex
 * shader by comparing each point's surface normal to the view direction, so
 * events behind the sphere never show through it (depth-testing alone is not
 * enough for additive-free point sprites near the limb).
 */

export const markerVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aSize;
  attribute float aActive;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;

  varying vec3 vColor;
  varying float vActive;
  varying float vCulled;

  void main() {
    vColor = aColor;
    vActive = aActive;

    // Cull the far hemisphere: a point is visible only when its outward normal
    // faces the camera. (Sphere is centred at the origin, so normal = position.)
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 worldNormal = normalize(worldPos);
    vec3 viewDir = normalize(cameraPosition - worldPos);
    vCulled = dot(worldNormal, viewDir) < 0.12 ? 1.0 : 0.0;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float pulse = vActive > 0.5 ? 0.94 + 0.06 * sin(uTime * 1.8 + aPhase) : 1.0;
    float size = aSize * uSizeScale * uPixelRatio * pulse * (1.0 / -mvPosition.z);

    gl_PointSize = vCulled > 0.5 ? 0.0 : size;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const markerFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vActive;
  varying float vCulled;

  const vec3 INK = vec3(0.039); // #0a0a0a

  void main() {
    if (vCulled > 0.5) discard;

    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float disc = smoothstep(0.5, 0.44, dist);   // outer edge (the ink ring)
    float core = smoothstep(0.34, 0.30, dist);  // inner colour fill

    if (vActive > 0.5) {
      // Active: colour dot inside a thin ink ring.
      vec3 color = mix(INK, vColor, core);
      gl_FragColor = vec4(color, disc);
    } else {
      // Closed: hollow ink ring — transparent centre.
      gl_FragColor = vec4(INK, disc * (1.0 - core));
    }
  }
`
