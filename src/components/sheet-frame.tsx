import { CrossMark } from '@/components/cross-mark'

/**
 * Fixed registration marks around the viewport — corner crosshairs and
 * mid-edge ticks, like the alignment marks on a drawing sheet.
 */
export function SheetFrame() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden text-foreground/30 select-none sm:block"
    >
      <CrossMark className="top-2.5 left-2.5" />
      <CrossMark className="top-2.5 right-2.5" />
      <CrossMark className="bottom-2.5 left-2.5" />
      <CrossMark className="right-2.5 bottom-2.5" />

      {/* mid-edge ticks */}
      <span className="absolute top-0 left-1/2 h-2 w-px -translate-x-1/2 bg-current" />
      <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-current" />
      <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-current" />
      <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 bg-current" />
    </div>
  )
}
