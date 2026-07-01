import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Append the → glyph (the system's one link affordance). */
  arrow?: boolean
}

/**
 * In this system there are no filled buttons. An action reads as editorial text
 * with a hairline underline that fades on hover — emphasis by ink weight, not
 * by chrome. `primary` is primary-ink, everything else is quiet secondary-ink.
 */
const VARIANT: Record<Variant, string> = {
  primary: 'text-content-primary font-medium',
  secondary: 'text-content-primary',
  ghost: 'text-content-secondary',
  danger: 'text-content-primary'
}

const SIZE: Record<Size, string> = {
  sm: 'text-2xs tracking-meta uppercase',
  md: 'text-sm'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', arrow, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-baseline gap-1.5 border-b border-current pb-px hover-fade',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {children}
      {arrow && (
        <span aria-hidden className="ml-0.5">
          →
        </span>
      )}
    </button>
  )
})
