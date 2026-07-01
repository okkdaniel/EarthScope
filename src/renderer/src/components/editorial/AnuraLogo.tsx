import anuraUrl from '@renderer/assets/brand/anura.svg'
import { cn } from '../../utils/cn'

/**
 * The Anura brand mark. A solid black frog silhouette (Anura = the order of
 * frogs) — a single ink shape that sits naturally in the monochrome system.
 * Rendered as a bundled asset so it stays crisp and needs no network.
 */
export function AnuraLogo({
  size = 22,
  className,
  title = 'Anura'
}: {
  size?: number
  className?: string
  title?: string
}): JSX.Element {
  return (
    <img
      src={anuraUrl}
      width={size}
      height={size}
      alt={title}
      className={cn('block select-none', className)}
      draggable={false}
    />
  )
}
