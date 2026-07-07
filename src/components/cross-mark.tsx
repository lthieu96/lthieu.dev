import { cn } from '@/lib/utils'

/** Small + crosshair, as used for registration/center marks on drawings. */
export function CrossMark({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span aria-hidden="true" className={cn('absolute size-3.5', className)} style={style}>
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
    </span>
  )
}
