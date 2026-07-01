import type { ReactNode } from 'react'

/** Consistent page header used by the full-page views. */
export function ViewHeader({
  title,
  subtitle,
  actions
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}): JSX.Element {
  return (
    <header className="flex items-end justify-between gap-4 px-8 pb-6 pt-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-content-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-content-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
