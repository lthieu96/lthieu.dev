import { Pause, Play } from 'lucide-react'
import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import NumberFlow from '@/components/number-flow'
import { useReducedMotion } from '@/lib/use-media-query'

// The pieces the architecture figures share, so they read as one system: the clock, the frame,
// the detail panel, the step track, node colours and how a part gets selected.

/** Something new that appears (a row, a card) rises out of a soft blur. To change text in place, use Swap. */
export const textIn = 'animate-[text-in_240ms_var(--ease-out)] motion-reduce:animate-none'
/** Border of a part I built. */
export const MINE = 'color-mix(in srgb, var(--color-accent) 45%, var(--color-edge))'
/** Fill of a part that data is passing through. */
export const LIVE_FILL = 'color-mix(in srgb, var(--color-accent) 5%, var(--color-card))'
/** Below this frame width the figures switch to their stacked layout. */
export const NARROW = 640

/**
 * The link shape every architecture figure shares: an S-curve that leaves and lands level, so
 * links read as soft wires. `side`: from a right edge to a left edge; else from a bottom to a top.
 */
export function curve(x1: number, y1: number, x2: number, y2: number, side: boolean) {
  if (side) {
    const mx = (x1 + x2) / 2
    return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
  }
  const my = (y1 + y2) / 2
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`
}

export const clamp = (x: number) => Math.min(1, Math.max(0, x))
/** In-out, so things moving along a path ease off one end and settle onto the other. */
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
/** A made-up but smooth price walk; the same on the server and the client. */
export const wave = (k: number) =>
  Math.sin(k * 0.9) * 4 + Math.sin(k * 0.37) * 6 + Math.sin(k * 2.1) * 2

/**
 * The clock a figure runs on, in ms since it started (take `% loop` for the place in the loop).
 * While playing and on screen it advances and calls `renderRef` every frame; paused or off screen
 * it stops asking for frames, unless `ambient` motion (Sway's price ticks) should keep drifting.
 * Reduced motion starts paused on the `still` frame. `speed` scales how fast it runs.
 */
export function useFigureClock(
  target: RefObject<Element | null>,
  { still, ambient = false }: { still: number; ambient?: boolean },
) {
  const reduce = useReducedMotion()
  const clock = useRef(0)
  const renderRef = useRef<() => void>(undefined)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (reduce) clock.current = still
    setPlaying(!reduce)
  }, [reduce, still])

  const drift = ambient && !reduce
  useEffect(() => {
    let raf = 0
    let last = 0
    let visible = true
    const frame = (now: number) => {
      raf = 0
      if (playing) clock.current += Math.min(64, now - (last || now)) * speed
      last = now
      renderRef.current?.()
      if (visible && (playing || drift)) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (raf || !visible) return
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    })
    if (target.current) io.observe(target.current)
    kick()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [target, playing, drift, speed])

  return { reduce, clock, renderRef, playing, setPlaying, speed, setSpeed }
}

/**
 * Calls `measure` whenever any of `els` changes size, and once more when web fonts finish
 * loading. Watching only the figure isn't enough: a late font can resize one card, moving it
 * inside its row, while the figure keeps its size and the links would point at the old spot.
 */
export function watchLayout(els: Iterable<Element | null | undefined>, measure: () => void) {
  const ro = new ResizeObserver(measure)
  for (const el of els) if (el) ro.observe(el)
  let live = true
  document.fonts?.ready.then(() => live && measure())
  return () => {
    live = false
    ro.disconnect()
  }
}

/** Filled accent: built by me. Hollow: the team. */
export function Dot({ mine }: { mine?: boolean }) {
  return (
    <i
      className={`inline-block size-1.5 flex-none rounded-full ${mine ? 'bg-accent' : 'border border-subtle'}`}
    />
  )
}

/** Breaks out of the 600px reading column to 880px, like the case-study media. */
export function ArchFigure({
  title,
  mineLabel,
  narrow,
  frameRef,
  children,
}: {
  title: string
  mineLabel: string
  narrow: boolean
  frameRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <figure className="relative left-1/2 mt-5 w-[min(880px,100vw-40px)] -translate-x-1/2">
      <div
        ref={frameRef}
        className={`rounded-2xl border border-line bg-media text-ui ${narrow ? 'p-4' : 'px-6 pt-[18px] pb-4'}`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-meta text-muted">
          <span>{title}</span>
          <span className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5">
              <Dot mine />
              {mineLabel}
            </span>
            <span className="flex items-center gap-1.5 max-[420px]:hidden">
              <Dot />
              team
            </span>
          </span>
        </div>
        {children}
      </div>
      <figcaption className="pt-2.5 font-mono text-meta text-subtle">
        Sample data. Hover, focus or tap a part to see what it does and who built it.
      </figcaption>
    </figure>
  )
}

export type PartInfo = {
  title: string
  mine: boolean
  /** "built by me", "co-built", "team"… */
  chip: string
  what: string
  mineText?: string
  teamText?: string
}

/**
 * Crossfades content that changes in place: the old copy drifts up into a blur while the new one
 * rises out of one, both in the same spot, so the text never blinks out. `k` says when it changed;
 * `as="g"` works inside SVG.
 */
export function Swap({
  k,
  as = 'span',
  className = '',
  children,
}: {
  k: string | number
  as?: 'span' | 'div' | 'g'
  className?: string
  children: ReactNode
}) {
  const [shown, setShown] = useState(k)
  const [old, setOld] = useState<{ k: string | number; node: ReactNode } | null>(null)
  // What the last render showed, so the outgoing copy has its final numbers, not its first ones.
  const last = useRef(children)
  useEffect(() => {
    last.current = children
  })
  if (shown !== k) {
    setShown(k)
    setOld({ k: shown, node: last.current })
  }
  const Tag = as as 'span'
  const cell = as === 'g' ? '' : '[grid-area:1/1]'
  return (
    <Tag className={`${as === 'g' ? '' : 'grid'} ${className}`}>
      {old && (
        <Tag
          key={`out-${old.k}`}
          aria-hidden
          onAnimationEnd={(e) => e.target === e.currentTarget && setOld(null)}
          className={`${cell} pointer-events-none animate-[text-out_180ms_var(--ease-out)_forwards] motion-reduce:hidden`}
        >
          {old.node}
        </Tag>
      )}
      <Tag
        key={`in-${k}`}
        className={`${cell} animate-[text-in_240ms_var(--ease-out)] motion-reduce:animate-none`}
      >
        {children}
      </Tag>
    </Tag>
  )
}

/** The selected part, or else the current step's text. */
export function Detail({
  domId,
  selKey,
  part,
  chapter,
  text,
  narrow,
  minH,
}: {
  /** px reserved [wide, narrow]: the tallest part or step text, measured, so nothing moves. */
  minH: [number, number]
  /** For the nodes' `aria-describedby`. */
  domId: string
  selKey: string | null
  part: PartInfo | null
  chapter: number
  text: ReactNode
  narrow: boolean
}) {
  return (
    <div
      id={domId}
      aria-live={part ? 'polite' : 'off'}
      style={{ minHeight: minH[narrow ? 1 : 0] }}
      className="pt-2"
    >
      <Swap as="div" k={part ? `part-${selKey}` : `step-${chapter}`}>
        {part ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-medium text-fg">{part.title}</h3>
              <span
                className={`rounded-full border px-2 font-mono text-[11px] leading-normal ${part.mine ? 'border-accent text-accent' : 'border-edge text-muted'}`}
              >
                {part.chip}
              </span>
            </div>
            <p className="mt-1 max-w-[64ch] text-prose">{part.what}</p>
            {(part.mineText || part.teamText) && (
              <p className="mt-1 font-mono text-meta text-muted">
                {part.mineText && (
                  <span className="mr-4">
                    <span className="text-accent">mine</span> · {part.mineText}
                  </span>
                )}
                {part.teamText && <span>team · {part.teamText}</span>}
              </p>
            )}
          </div>
        ) : (
          <p className="max-w-[64ch] text-prose">{text}</p>
        )}
      </Swap>
    </div>
  )
}

const two = { minimumIntegerDigits: 2 }
const SPEEDS = [1, 1.5, 2, 0.5]
const iconSwap =
  '[grid-area:1/1] transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none'
const iconOff = 'scale-50 opacity-0 blur-[2px]'
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Play/pause, a speed button that cycles through SPEEDS, and a thin segment per step, filled
 * from the figure's clock through `barRefs`.
 * Click a segment to jump, drag across them to scrub, K to play or pause. Hovering a segment names
 * its step where the counter sits; `marked` tints the steps the selected part takes part in.
 */
export function Track({
  playing,
  onToggle,
  speed,
  onSpeed,
  labels,
  current,
  onJump,
  onSeek,
  marked,
  barRefs,
}: {
  playing: boolean
  onToggle: () => void
  speed: number
  onSpeed: (speed: number) => void
  labels: string[]
  current: number
  onJump: (i: number) => void
  /** Scrub to `f` (0 to 1) of the way through step `i`. */
  onSeek: (i: number, f: number) => void
  marked: Set<number>
  barRefs: RefObject<HTMLElement[]>
}) {
  const buttons = useRef<HTMLButtonElement[]>([])
  const row = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const drag = useRef<{ x: number; resume: boolean; moving: boolean } | null>(null)

  const seekAt = (x: number) => {
    const bs = buttons.current
    for (const [i, b] of bs.entries()) {
      const r = b.getBoundingClientRect()
      if (x < r.right || i === bs.length - 1) return onSeek(i, clamp((x - r.left) / r.width))
    }
  }

  // K plays or pauses while focus is anywhere in the figure. Not Space: here it presses buttons.
  const toggle = useRef(onToggle)
  toggle.current = onToggle
  useEffect(() => {
    const fig = row.current?.closest('figure')
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'k' || e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      toggle.current()
    }
    fig?.addEventListener('keydown', onKeyDown)
    return () => fig?.removeEventListener('keydown', onKeyDown)
  }, [])
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const j = (i + (e.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length
    buttons.current[j]?.focus()
    onJump(j)
  }
  return (
    <div data-controls className="mt-4 flex items-center gap-3 border-line border-t pt-3">
      <button
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
        aria-keyshortcuts="K"
        title={playing ? 'Pause (K)' : 'Play (K)'}
        onClick={onToggle}
        className="grid size-7 flex-none cursor-pointer place-items-center rounded-full border border-edge bg-card text-fg transition-[background-color,scale] duration-150 ease-out hover:bg-hover active:scale-90 motion-reduce:transition-none"
      >
        {/* Both icons stay mounted in one cell, so the swap is a blur-and-scale crossfade. */}
        <Pause size={12} aria-hidden className={`${iconSwap} ${playing ? '' : iconOff}`} />
        <Play size={12} aria-hidden className={`${iconSwap} ${playing ? iconOff : ''}`} />
      </button>
      {/* Fixed width, so going from 2× to 1.5× never resizes the segments. */}
      <button
        type="button"
        aria-label={`Playback speed ${speed}×`}
        title="Playback speed"
        onClick={() => onSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
        className="w-[4ch] flex-none cursor-pointer text-left font-mono text-meta text-subtle tabular-nums transition-[color,scale] duration-150 ease-out hover:text-fg active:scale-90 motion-reduce:transition-none"
      >
        {/* A crossfade, not NumberFlow: speed is a choice, so it shouldn't roll through 1.3, 1.4… */}
        <Swap k={speed}>{speed}×</Swap>
      </button>
      {/* A press that moves more than 4px scrubs (pausing while it does); a plain click still jumps.
          pan-y keeps the page scrolling on phones. The row fills the controls' height plus 8px above
          and below, gaps included, so a hand drifting off the 2px line doesn't flip to an arrow. */}
      <div
        ref={row}
        className="-my-2 flex min-w-0 flex-1 cursor-pointer touch-pan-y gap-1 self-stretch"
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, resume: playing, moving: false }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          if (!d.moving) {
            if (Math.abs(e.clientX - d.x) < 4) return
            d.moving = true
            e.currentTarget.setPointerCapture(e.pointerId)
            if (playing) onToggle()
          }
          seekAt(e.clientX)
        }}
        onPointerUp={() => {
          if (drag.current?.moving && drag.current.resume) onToggle()
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        {labels.map((k, i) => (
          <button
            key={k}
            ref={(el) => {
              if (el) buttons.current[i] = el
            }}
            type="button"
            aria-label={`Step ${i + 1}: ${k}`}
            aria-current={i === current ? 'step' : undefined}
            onClick={() => onJump(i)}
            onKeyDown={(e) => onKey(e, i)}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="group min-w-0 flex-1 cursor-pointer py-2.5"
          >
            <span
              className={`block h-0.5 overflow-hidden rounded-full transition-colors duration-150 ${marked.has(i) ? 'bg-accent/35' : 'bg-edge group-hover:bg-subtle/40'}`}
            >
              <i
                ref={(el) => {
                  if (el) barRefs.current[i] = el
                }}
                className={`block h-full w-0 rounded-full ${i === current ? 'bg-accent' : 'bg-fg/25'}`}
              />
            </span>
          </button>
        ))}
      </div>
      {/* Fixed width, so naming a step on hover never resizes the segments. One key for the counter:
          its digits roll from step to step instead of the whole label cross-fading. */}
      <Swap
        k={hover === null ? 'n' : `h${hover}`}
        className="w-[10ch] flex-none whitespace-nowrap text-right font-mono text-meta text-subtle tabular-nums"
      >
        {hover === null ? (
          <span>
            {/* -my-1 cancels NumberFlow's padding for its fade mask, so the counter keeps the
                label's line height and the swap on hover doesn't nudge it a pixel. */}
            <NumberFlow value={current + 1} format={two} className="-my-1" />/{pad(labels.length)}
          </span>
        ) : (
          labels[hover]
        )}
      </Swap>
    </div>
  )
}

/**
 * Which part is selected. Hover selects after 60ms (so a passing cursor doesn't flicker the
 * figure), focus and click at once; a click pins it, and a click outside or Escape clears it.
 */
export function useSelection<Id extends string>(scope: RefObject<Element | null>) {
  const [sel, setSel] = useState<Id | null>(null)
  const pinned = useRef<Id | null>(null)
  const timer = useRef(0)

  useEffect(() => {
    const clear = (e: globalThis.PointerEvent) => {
      if ((e.target as Element).closest('[data-node], [data-controls]')) return
      pinned.current = null
      setSel(null)
    }
    document.addEventListener('pointerdown', clear)
    return () => document.removeEventListener('pointerdown', clear)
  }, [])

  const now = (id: Id | null) => {
    clearTimeout(timer.current)
    setSel(id)
  }
  const later = (id: Id | null, ms: number) => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSel(id), ms)
  }

  const bind = (id: Id) => ({
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') later(id, sel ? 0 : 60)
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') later(pinned.current, 80)
    },
    onFocus: () => now(id),
    onBlur: (e: FocusEvent) => {
      if (!scope.current?.contains(e.relatedTarget as Node | null)) now(pinned.current)
    },
    onClick: () => {
      pinned.current = id
      now(id)
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Clear without blurring, so keyboard focus stays where it was instead of jumping to the page.
      pinned.current = null
      now(null)
    },
  })

  return { sel, bind }
}
