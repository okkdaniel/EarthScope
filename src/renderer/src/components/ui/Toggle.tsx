import { cn } from '../../utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/** An accessible switch control. */
export function Toggle({ checked, onChange, label }: ToggleProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-out-soft',
        checked ? 'bg-accent' : 'bg-surface-hover'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out-soft',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
