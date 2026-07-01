import { useMemo } from 'react'
import { BackSide, Color, NormalBlending, ShaderMaterial } from 'three'
import { ATMOSPHERE_RADIUS } from './globeConstants'

/**
 * A faint limb — a hairline of soft shading just outside the sphere's edge. Not
 * a glow (the system forbids glows): a low-opacity Fresnel rim in ink that reads
 * as the drawn edge of the survey, keeping the globe legible on the warm canvas.
 */
export function Atmosphere({ visible = true }: { visible?: boolean }): JSX.Element | null {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        side: BackSide,
        blending: NormalBlending,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color('#0a0a0a') },
          uIntensity: { value: 0.16 }
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          uniform vec3 uColor;
          uniform float uIntensity;
          void main() {
            float rim = pow(1.0 - abs(vNormal.z), 4.0);
            gl_FragColor = vec4(uColor, rim * uIntensity);
          }
        `
      }),
    []
  )

  if (!visible) return null

  return (
    <mesh scale={ATMOSPHERE_RADIUS}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
