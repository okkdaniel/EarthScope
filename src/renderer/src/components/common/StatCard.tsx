import { Eyebrow } from '../editorial/Eyebrow'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  /** Optional event-category colour shown as a small data mark. */
  accentColor?: string
}

/**
 * A single figure in a ledger: an uppercase label, a large serif number, and a
 * quiet caption, opened by a strong hairline. Not a card — it groups by rule.
 */
export function StatCard({ label, value, hint, accentColor }: StatCardProps): JSX.Element {
  return (
    <div className="border-t border-content-primary pt-3.5">
      <Eyebrow className="flex items-center gap-2">
        {accentColor && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden
          />
        )}
        {label}
      </Eyebrow>
      <div className="display tabular mt-3 text-4xl leading-none text-content-primary">{value}</div>
      {hint && <div className="mt-2 text-xs text-content-secondary">{hint}</div>}
    </div>
  )
}
