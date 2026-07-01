/**
 * Hand-drawn 1px-stroke glyphs in `currentColor`.
 *
 * The design system forbids any icon library (no Lucide, no emoji). The only
 * directional/marks it permits are drawn inline at a single-pixel stroke. This
 * is that small, deliberate set — nothing here is decorative.
 */

interface GlyphProps {
  size?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1,
  'aria-hidden': true
})

export function CloseGlyph({ size = 14, className }: GlyphProps): JSX.Element {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

export function PlayGlyph({ size = 14, className }: GlyphProps): JSX.Element {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 3.5l7 4.5-7 4.5z" />
    </svg>
  )
}

export function PauseGlyph({ size = 14, className }: GlyphProps): JSX.Element {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 3.5v9M10 3.5v9" />
    </svg>
  )
}

export function ChevronGlyph({ size = 14, className }: GlyphProps): JSX.Element {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

export function ArrowRightGlyph({ size = 14, className }: GlyphProps): JSX.Element {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
