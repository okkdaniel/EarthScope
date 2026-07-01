import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CommonProps {
  children: ReactNode
  /** Append the → glyph — the only icon the system allows beside a link. */
  arrow?: boolean
  /** Low-emphasis (secondary ink). */
  quiet?: boolean
  /** Hide the hairline underline (used in nav rows). */
  underline?: boolean
  className?: string
}

type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }
type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as: 'button' }

/**
 * EditorialLink — a text link in the editorial vocabulary: same-colour hairline
 * underline that fades on hover (opacity 0.55). No colour change, no fill, no
 * scale. Renders as an anchor by default or a button via `as="button"`.
 */
export function EditorialLink(props: LinkProps | ButtonProps): JSX.Element {
  const { children, arrow, quiet, underline = true, className, ...rest } = props
  const classes = cn(
    'inline-flex items-baseline hover-fade',
    quiet ? 'text-content-secondary' : 'text-content-primary',
    underline && 'border-b border-current pb-px',
    className
  )
  const content = (
    <>
      {children}
      {arrow && (
        <span aria-hidden className="ml-1.5">
          →
        </span>
      )}
    </>
  )

  if (props.as === 'button') {
    const { as: _as, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: string
    }
    return (
      <button type="button" className={classes} {...buttonRest}>
        {content}
      </button>
    )
  }
  return (
    <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {content}
    </a>
  )
}
