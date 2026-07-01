import type { ReactNode } from 'react'

/** A labelled settings row: title + description on the left, control on the right. */
export function SettingRow({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: ReactNode
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-content-primary">{title}</p>
        {description && <p className="mt-0.5 text-xs text-content-tertiary">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
  )
}
