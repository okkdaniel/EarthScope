import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  accent?: string
}

/** A single KPI tile. Whitespace over borders; no boxes inside boxes. */
export function StatCard({ label, value, hint, icon: Icon, accent }: StatCardProps): JSX.Element {
  return (
    <div className="panel flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 text-content-tertiary">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5"
            strokeWidth={1.75}
            style={accent ? { color: accent } : undefined}
          />
        )}
        <span className="text-2xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-semibold tabular-nums text-content-primary">{value}</span>
      {hint && <span className="text-xs text-content-tertiary">{hint}</span>}
    </div>
  )
}
