import { useMemo } from 'react'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute } from 'three'

/**
 * A subtle static star field far behind the globe. Points only, additive, dim —
 * atmosphere rather than decoration.
 */
export function Starfield({ count = 1400, radius = 90 }: { count?: number; radius?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Uniform distribution on a sphere shell.
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * (0.8 + Math.random() * 0.2)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = Math.random() < 0.92 ? 0.35 : 0.8
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('size', new Float32BufferAttribute(sizes, 1))
    return geo
  }, [count, radius])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#aab6c8"
        size={0.5}
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
