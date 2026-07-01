import { useMemo } from 'react'
import { BackSide, Color, ShaderMaterial } from 'three'
import { ATMOSPHERE_RADIUS } from './globeConstants'

/**
 * A soft atmospheric halo using a Fresnel term on a slightly larger back-facing
 * sphere. Gives the globe a gentle glow at the limb (CLAUDE.md: "Soft
 * atmospheric glow") without washing over the surface detail.
 */
export function Atmosphere({ visible = true }: { visible?: boolean }): JSX.Element | null {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color('#4c8bf5') },
          uIntensity: { value: 0.9 }
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
            // Rim brightens toward the silhouette edge.
            float rim = pow(1.0 - abs(vNormal.z), 3.0);
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
