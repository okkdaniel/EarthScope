import { cn } from '../../utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/**
 * A square hairline toggle that fills with ink when on — no pill, no colour.
 * Reads like a checkbox on an engineering form.
 */
export function Toggle({ checked, onChange, label }: ToggleProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-4 w-4 items-center justify-center border transition-colors duration-200 ease-quiet',
        checked ? 'border-content-primary bg-content-primary' : 'border-content-tertiary bg-transparent'
      )}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5l2 2 4-5" stroke="var(--paper-100)" strokeWidth="1" />
        </svg>
      )}
    </button>
  )
}
