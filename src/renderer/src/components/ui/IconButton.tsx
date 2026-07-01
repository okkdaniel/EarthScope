import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the control has no visible text. */
  label: string
  active?: boolean
}

/**
 * A compact control wrapping one of the hand-drawn {@link Glyph} marks. No
 * background, no rounding — just ink that fades on hover, per the system.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, active = false, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      data-active={active}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center hover-fade',
        active ? 'text-content-primary' : 'text-content-secondary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
