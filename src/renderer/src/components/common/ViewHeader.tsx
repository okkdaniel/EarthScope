import type { ReactNode } from 'react'
import { Eyebrow } from '../editorial/Eyebrow'

/**
 * The page header for full-screen views. An uppercase eyebrow sits above a
 * serif display title, closed by a strong hairline rule — the editorial way to
 * open a section (no card, no icon, weight from scale).
 */
export function ViewHeader({
  eyebrow,
  title,
  subtitle,
  actions
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}): JSX.Element {
  return (
    <header className="border-b border-content-primary px-10 pb-6 pt-10">
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h1 className="display text-5xl leading-none tracking-display-tight text-content-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-content-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-5">{actions}</div>}
      </div>
    </header>
  )
}
