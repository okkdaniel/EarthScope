import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the button has no visible text. */
  label: string
  active?: boolean
}

/** A square, icon-only button with an accessible label. */
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
        'inline-flex h-9 w-9 items-center justify-center rounded-lg',
        'text-content-secondary transition-colors duration-150 ease-out-soft',
        'hover:bg-surface-hover hover:text-content-primary',
        'data-[active=true]:bg-surface-hover data-[active=true]:text-content-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
