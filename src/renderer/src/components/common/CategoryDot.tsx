import { resolveCategoryMeta } from '@shared/models/category'
import { cn } from '../../utils/cn'

interface CategoryDotProps {
  categoryId: string
  size?: number
  className?: string
}

/** A small colour-coded dot representing an event category. */
export function CategoryDot({ categoryId, size = 8, className }: CategoryDotProps) {
  const meta = resolveCategoryMeta(categoryId)
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: meta.color }}
      title={meta.label}
      aria-hidden="true"
    />
  )
}
