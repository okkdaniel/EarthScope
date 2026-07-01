import { useMemo } from 'react'
import { cn } from '../../utils/cn'

/**
 * The brand contour mark — a black-on-warm-gray topographic survey drawn as
 * iso-lines around a few "sources". It reads like a CMM scan or tool-sweep, not
 * a tech cliché. Per the design system it is always behind content, uses
 * `multiply` blending so text stays legible, and is the only element that isn't
 * fully opaque. Never centre it, never frame content with it, never tile it.
 */

interface Source {
  cx: number
  cy: number
  rings: number
  step: number
  rx: number
  ry: number
  rotate: number
}

const SOURCES: Source[] = [
  { cx: 360, cy: 420, rings: 15, step: 27, rx: 1, ry: 0.82, rotate: -18 },
  { cx: 690, cy: 640, rings: 12, step: 30, rx: 0.9, ry: 1, rotate: 24 },
  { cx: 520, cy: 250, rings: 7, step: 22, rx: 1, ry: 0.7, rotate: 8 }
]

interface ContourMarkProps {
  className?: string
  /** 0.34–0.52 depending on how much text sits over it (design system). */
  opacity?: number
  style?: React.CSSProperties
}

export function ContourMark({ className, opacity = 0.42, style }: ContourMarkProps): JSX.Element {
  const ellipses = useMemo(() => {
    const shapes: JSX.Element[] = []
    SOURCES.forEach((source, s) => {
      for (let i = 1; i <= source.rings; i++) {
        const r = i * source.step
        shapes.push(
          <ellipse
            key={`${s}-${i}`}
            cx={source.cx}
            cy={source.cy}
            rx={r * source.rx}
            ry={r * source.ry}
            transform={`rotate(${source.rotate} ${source.cx} ${source.cy})`}
          />
        )
      }
    })
    return shapes
  }, [])

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 1000"
      className={cn('pointer-events-none select-none', className)}
      style={{ mixBlendMode: 'multiply', opacity, ...style }}
      fill="none"
      stroke="#0a0a0a"
      strokeWidth={1}
    >
      {ellipses}
    </svg>
  )
}
