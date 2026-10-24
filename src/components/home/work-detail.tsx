import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/use-media-query'

/*
 * The detail a Selected work thumbnail wipes to: one real piece of each app, rebuilt at the app's
 * own size (384×240 pt) and scaled into the 128×80 thumb. Colours, sizes and motion come from the
 * apps' source (sway/apps/mobile, cerebro-web/apps/web, madeezi/gmg-mobile). BenKon has no source
 * here, so it is styled from screenshots and has no motion of its own.
 */

/** Untitled UI icons (MIT), paths copied from @untitledui/icons. */
const uui = {
  trendUp:
    'm22 7-7.869 7.869c-.396.396-.594.594-.822.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668L9.13 12.13c-.396-.396-.594-.594-.822-.668a1 1 0 0 0-.618 0c-.228.074-.426.272-.822.668L2 17M22 7h-7m7 0v7',
  trendDown:
    'm22 17-7.869-7.869c-.396-.396-.594-.594-.822-.668a1 1 0 0 0-.618 0c-.228.074-.426.272-.822.668L9.13 11.87c-.396.396-.594.594-.822.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668L2 7m20 10h-7m7 0v-7',
  xClose: 'M18 6 6 18M6 6l12 12',
}

/** GreenMaster's own icons, from madeezi/lucide/icons/{gmg,freud}, paths as in the SVG files. */
const gmg = {
  mouse: [
    'M1.263 14.891c0-4.676 1.902-7.664 5.684-8.818 1.374-.419 2.436-1.076 2.436-2.404a2.42 2.42 0 0 0-4.06-1.793',
    'M14.255 14.891c-.751-.664-1.083-1.592-.553-2.726.387-.828 1.255-1.301 2.179-1.282 1.657.034 2.397 1.077 2.435 2.404.025.9 2.286 2.698 3.423 3.546a1.59 1.59 0 0 1 .637 1.273v.793a1.615 1.615 0 0 1-1.624 1.604H6.135c-3.832-.001-4.872-3.733-4.872-5.612 0-2.555 1.648-5.612 5.684-5.612 3.654 0 5.512.94 7.168 2.293',
    'M16.692 16.494h.01',
  ],
  fly: [
    'M14.302 15.11a4.8 4.8 0 0 0 1.449-.231c-.443 1.656-1.688 3.515-3.278 4.896-2.534 2.204-6.494 3.9-8.206 1.244-1.282-1.99.08-5.357 3.207-7.318a13.5 13.5 0 0 1 2.848-1.338c.295 1.554 1.956 2.747 3.98 2.747',
    'M14.302 8.645a4.8 4.8 0 0 1 1.449.232c-.443-1.658-1.688-3.515-3.278-4.897C9.94 1.776 5.98.08 4.268 2.736c-1.282 1.99.08 5.358 3.207 7.318a13.5 13.5 0 0 0 2.848 1.338c.295-1.553 1.955-2.748 3.979-2.747',
    'm15.5 15.63 2.843 2.713h2.424l1.617 1.616',
    'm15.5 8.124 2.843-2.712h2.424l1.617-1.616',
    'M15.918 1.371v1.617L13.695 5.21',
    'M15.918 22.384v-1.617l-2.223-2.223',
    'M16.727 11.877c0 1.786.904 3.233 2.02 3.233s2.02-1.447 2.02-3.233-.905-3.232-2.02-3.232-2.02 1.447-2.02 3.232',
    'M16.727 11.877c0-.844.207-1.607.539-2.182-.739-.642-1.788-1.05-2.964-1.05-2.231 0-4.041 1.447-4.041 3.232s1.81 3.233 4.04 3.233c1.177 0 2.226-.408 2.965-1.05-.332-.575-.54-1.338-.54-2.183',
    'm22.384 10.261-1.617 1.616 1.617 1.617',
    'M7.474 13.7a13 13 0 0 1 2.848-1.337 3 3 0 0 1-.061-.486 3 3 0 0 1 .062-.485 13.5 13.5 0 0 1-2.849-1.337 9.2 9.2 0 0 1-1.707-1.382c-2.492.154-4.396 1.025-4.396 3.205s1.904 3.051 4.396 3.205a9.2 9.2 0 0 1 1.707-1.382',
  ],
  termite: [
    'M1.454 12C1.454 13.894 2.68 15.428 4.966 15.428',
    'M10.758 10.286 14.07 4.286',
    'M10.759 10.286C10.017 10.286 9.322 10.528 8.867 10.902',
    'M10.759 13.714 14.07 19.715',
    'M10.759 13.715C11.521 13.715 12.158 13.485 12.612 13.13',
    'M10.759 20.572V13.715',
    'M10.759 3.428V10.286',
    'M12.5 1 10.759 3.428',
    'M12.5 23 10.759 20.572',
    'M12.612 10.871C12.158 10.514 11.5 10.286 10.758 10.286',
    'M12.612 13.13A3.5 3.5 0 0 1 12.612 10.871',
    'M14.07 19.715H17.38',
    'M14.07 4.286H17.38',
    'M19.862 10.286 22.345 9.429',
    'M19.862 13.715 22.345 14.572',
    'M22.345 14.572 23 13.5',
    'M22.345 9.429 23 10.5',
    'M4.966 15.428C6.784 15.428 8.312 14.449 8.866 13.098',
    'M4.966 8.572C2.68 8.572 1.454 10.106 1.454 12',
    'M8.866 13.098C9.322 13.471 9.996 13.714 10.759 13.714',
    'M8.867 10.902C8.312 9.551 6.785 8.572 4.966 8.572',
    'M10.758 13.715 6.62 18.857H2.483',
    'M15.724 8.572c-1.828 0-3.31 1.534-3.31 3.428s1.482 3.428 3.31 3.428h2.483c.914 0 1.655-.767 1.655-1.714v-3.428c0-.947-.741-1.714-1.655-1.714Z',
    'M2.483 5.143H6.62l4.139 5.143',
  ],
  // spray.svg is 16×24, drawn in a -4 0 24 24 box so it centres like the others.
  spray: [
    'M11.693 3.796q1.588 2.829 3.176 4.041',
    'M5.342 7.029C1.836 8.326 1.406 14.345 1.371 19.15v3.233h11.909v-3.233c-.035-4.806-.464-10.825-3.97-12.122',
    'm5.361 17.514 3.93-4',
    'M7.326 18.343c1.535 0 2.779-1.267 2.779-2.829S8.861 12.686 7.326 12.686s-2.778 1.267-2.778 2.829 1.244 2.829 2.778 2.829',
    'M9.311 7.029h-3.97V2.988C5.342 2.096 6.053 1.371 6.93 1.371h7.146v1.616L9.312 3.796z',
  ],
  ring: [
    'M14.3294 3.30667C16.2431 3.81944 17.9341 4.94935 19.1402 6.52115C20.3463 8.09294 21 10.0188 21 12C21 13.9812 20.3463 15.9071 19.1402 17.4789C17.9341 19.0506 16.2431 20.1806 14.3294 20.6933',
    'M9.67063 3.30667C7.75693 3.81944 6.0659 4.94935 4.85982 6.52115C3.65374 8.09295 3 10.0188 3 12C3 13.9812 3.65374 15.9071 4.85982 17.4789C6.0659 19.0507 7.75693 20.1806 9.67063 20.6933',
  ],
  check: [
    'M5 12C5 12.7911 5.2346 13.5645 5.67412 14.2223C6.11365 14.8801 6.73836 15.3928 7.46927 15.6955C8.20017 15.9983 9.00444 16.0775 9.78036 15.9231C10.5563 15.7688 11.1569 15.5 11.8284 14.8284L20.5 6.15686',
  ],
}

function Icon({
  d,
  className,
  strokeWidth = 2,
  viewBox = '0 0 24 24',
  caps = 'round',
}: {
  d: string | string[]
  className?: string
  strokeWidth?: number
  viewBox?: string
  caps?: 'round' | 'butt'
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={caps}
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {[d].flat().map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  )
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
/** CSS `ease-out`, cubic-bezier(0, 0, .58, 1): recharts' animationEasing. */
const cssEaseOut = (t: number) => {
  let lo = 0
  let hi = 1
  let s = 0.5
  for (let i = 0; i < 20; i++) {
    s = (lo + hi) / 2
    if (3 * (1 - s) * s * s * 0.58 + s ** 3 < t) lo = s
    else hi = s
  }
  return 3 * (1 - s) * s * s + s ** 3
}

type Cancel = () => void
/** Eases a value from `from` to `to` over `ms`, after `delay`; with reduced motion it jumps to `to`. */
function tween(
  reduced: boolean,
  ms: number,
  delay: number,
  ease: (t: number) => number,
  from: number,
  to: number,
  fn: (v: number) => void,
): Cancel {
  if (reduced) {
    fn(to)
    return () => {}
  }
  const t0 = performance.now() + delay
  let raf = 0
  const tick = (now: number) => {
    const t = Math.min(Math.max((now - t0) / ms, 0), 1)
    fn(from + (to - from) * ease(t))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
function later(reduced: boolean, ms: number, fn: () => void): Cancel {
  if (reduced) {
    fn()
    return () => {}
  }
  const id = window.setTimeout(fn, ms)
  return () => clearTimeout(id)
}

/**
 * Plays a detail's enter timeline when `on` turns true and its exit timeline when it turns false.
 * Each one starts from wherever the other left off, so moving quickly between rows never snaps.
 */
function useTimeline(
  on: boolean,
  enter: (reduced: boolean) => Cancel[],
  exit: (reduced: boolean) => Cancel[],
) {
  const reduced = useReducedMotion()
  const fns = useRef({ enter, exit })
  fns.current = { enter, exit }
  const mounted = useRef(false)
  useEffect(() => {
    // Nothing to exit on mount: the detail starts hidden under the logo.
    if (!mounted.current) {
      mounted.current = true
      if (!on) return
    }
    const cancels = (on ? fns.current.enter : fns.current.exit)(reduced)
    return () => {
      for (const cancel of cancels) cancel()
    }
  }, [on, reduced])
}

/* ─── Sway · feed card chart (area-chart-surface.tsx) and Sway buttons (news-sway-button.tsx) ─── */

const SWAY_LOGO = [
  'M0.334 18.851C0.334 18.562 0.154 18.201 0.1 17.913C-0.129 16.615 0.039 15.262 0.568 14.054C1.157 12.707 2.185 11.746 3.321 10.85C4.596 9.852 5.996 8.981 7.295 8.001C8.527 7.075 9.97 5.951 10.541 4.478C10.643 4.22 10.721 3.955 10.805 3.691C10.998 3.042 11.088 2.362 11.07 1.683C11.058 1.292 11.004 0.902 10.92 0.517C10.883 0.343 10.835 0.174 10.781 0C10.968 0.06 11.16 0.126 11.34 0.198C12.555 0.697 13.612 1.557 14.34 2.699C14.628 3.15 14.863 3.649 15.037 4.184C15.788 6.486 15.151 8.92 13.48 10.646C11.503 12.695 8.804 13.91 6.814 15.953C5.041 17.769 4.361 20.426 5.149 22.848C5.209 23.04 5.281 23.233 5.359 23.419C5.029 23.347 4.704 23.245 4.385 23.125C3.706 22.866 3.069 22.493 2.504 22.031C1.867 21.508 1.314 20.87 0.893 20.125C0.677 19.734 0.484 19.308 0.334 18.851Z',
  'M6.982 25.493C6.982 25.204 6.802 24.844 6.748 24.555C6.519 23.257 6.688 21.904 7.216 20.696C7.806 19.35 8.833 18.388 9.97 17.492C11.244 16.494 12.645 15.623 13.943 14.643C15.175 13.717 16.618 12.593 17.189 11.121C17.291 10.862 17.369 10.598 17.453 10.333C17.646 9.684 17.736 9.005 17.718 8.325C17.706 7.935 17.652 7.544 17.568 7.159C17.532 6.985 17.483 6.817 17.429 6.642C17.616 6.702 17.808 6.769 17.988 6.841C19.203 7.34 20.261 8.199 20.988 9.341C21.276 9.792 21.511 10.291 21.685 10.826C22.437 13.128 21.799 15.563 20.128 17.288C18.151 19.338 15.452 20.552 13.462 22.596C11.689 24.411 11.01 27.068 11.797 29.49C11.857 29.683 11.929 29.875 12.007 30.061C11.677 29.989 11.352 29.887 11.034 29.767C10.354 29.508 9.717 29.136 9.152 28.673C8.515 28.15 7.962 27.513 7.541 26.767C7.319 26.383 7.126 25.95 6.982 25.493Z',
]
const SWAY_YS = [62, 10, 44, 44, 30, 54, 54, 40, 8, 44, 44, 24, 42, 70, 36, 56]
const SWAY_BASE = 42 // the publish price the line morphs out of
const SWAY_MARKER = 12 // index of the point where the story was published

/** The chart's smooth line through the points, `k` of the way from the publish price to the data. */
function swayPoints(k: number) {
  return SWAY_YS.map((y, i) => [
    (i * 352) / (SWAY_YS.length - 1),
    12 + SWAY_BASE + (y - SWAY_BASE) * k,
  ])
}
function swayLine(pts: number[][]) {
  let d = `M${pts[0]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]]
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}

function Sway({ on }: { on: boolean }) {
  // SVG ids must be unique: the same detail can be on the page twice (row and preview card).
  const id = useId().replace(/[^\w-]/g, '')
  const svg = useRef<SVGSVGElement>(null)
  const [live, setLive] = useState(false)
  const [pressed, setPressed] = useState(false)
  // Written straight to the SVG each frame, so React doesn't re-render during the morph.
  const progress = useRef(0)
  const draw = (k: number) => {
    progress.current = k
    const el = svg.current
    if (!el) return
    const pts = swayPoints(k)
    const line = swayLine(pts)
    el.querySelector('.line')?.setAttribute('d', line)
    for (const a of el.querySelectorAll('.area')) a.setAttribute('d', `${line} L352,104 L0,104 Z`)
    const [mx, my] = pts[SWAY_MARKER]
    el.querySelector('.marker')?.setAttribute(
      'transform',
      `translate(${mx - 4.5},${my - 5.5}) scale(0.41)`,
    )
    const [ex, ey] = pts[pts.length - 1]
    for (const c of el.querySelectorAll('.end')) {
      c.setAttribute('cx', String(ex))
      c.setAttribute('cy', String(ey))
    }
  }
  // Line morph 300ms easeOutCubic (use-area-chart-model.ts), then Bullish is tapped:
  // 0.985 / 0.92 over 120ms, back over 220ms, both Easing.out(cubic) (button.tsx).
  useTimeline(
    on,
    (reduced) => [
      later(reduced, 0, () => setLive(true)),
      tween(reduced, 300, 60, easeOutCubic, progress.current, 1, draw),
      later(reduced, 480, () => setPressed(!reduced)),
      later(reduced, 600, () => setPressed(false)),
    ],
    // Out: the line morphs back to the publish price with the same 300ms easeOutCubic.
    (reduced) => [
      later(reduced, 0, () => {
        setLive(false)
        setPressed(false)
      }),
      tween(reduced, 300, 0, easeOutCubic, progress.current, 0, draw),
    ],
  )

  const initial = swayPoints(0)
  const line = swayLine(initial)
  const [mx, my] = initial[SWAY_MARKER]
  const [ex, ey] = initial[initial.length - 1]
  return (
    <div className="h-full bg-white p-4 font-[family-name:ui-rounded,'SF_Pro_Rounded',var(--font-sans)]">
      <svg
        ref={svg}
        aria-hidden
        viewBox="0 0 352 104"
        className="block h-[104px] w-[352px] overflow-visible"
      >
        <defs>
          <pattern id={`${id}sway-dots`} width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#3BB9FF" fillOpacity={0.9} />
          </pattern>
          <linearGradient id={`${id}sway-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".6" stopColor="#fff" stopOpacity={0.4} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`${id}sway-tint`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3BB9FF" stopOpacity={0.05} />
            <stop offset=".58" stopColor="#3BB9FF" stopOpacity={0.015} />
            <stop offset="1" stopColor="#3BB9FF" stopOpacity={0} />
          </linearGradient>
          <mask id={`${id}sway-mask`}>
            <rect width="352" height="104" fill={`url(#${id}sway-fade)`} />
          </mask>
        </defs>
        <path className="area" fill={`url(#${id}sway-tint)`} d={`${line} L352,104 L0,104 Z`} />
        <path
          className="area"
          fill={`url(#${id}sway-dots)`}
          mask={`url(#${id}sway-mask)`}
          d={`${line} L352,104 L0,104 Z`}
        />
        <line
          x1="0"
          x2="352"
          y1={12 + SWAY_BASE}
          y2={12 + SWAY_BASE}
          stroke="#EF4444"
          strokeWidth={0.75}
          strokeDasharray="3,3"
          strokeOpacity={0.35}
        />
        <path
          className="line"
          d={line}
          fill="none"
          stroke="#3BB9FF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g>
          {/* Live pulse: 1 → 3.5, 0.5 → 0 over 1500ms, Easing.out(quad), repeating (area-chart-pulse.tsx). */}
          <circle
            className={`end origin-center opacity-0 [transform-box:fill-box] ${live ? 'animate-[sway-pulse_1.5s_cubic-bezier(.5,1,.89,1)_.45s_infinite] motion-reduce:animate-none' : ''}`}
            cx={ex}
            cy={ey}
            r={4}
            fill="none"
            stroke="#3BB9FF"
            strokeWidth={1.5}
          />
          <circle className="end" cx={ex} cy={ey} r={4} fill="#3BB9FF" />
        </g>
        <g className="marker" transform={`translate(${mx - 4.5},${my - 5.5}) scale(0.41)`}>
          <circle cx="10.98" cy="13.41" r="19.51" fill="#EF4444" />
          {SWAY_LOGO.map((d) => (
            <path key={d} d={d} fill="#fff" />
          ))}
        </g>
      </svg>
      <div className="mt-2 flex gap-[3px]">
        <span className="h-[5px] flex-[3.30] rounded-[3px] bg-[#FFC5C5]" />
        <span className="h-[5px] flex-[3.61] rounded-[3px] bg-[#9FC4FF]" />
      </div>
      <div className="mt-1 flex justify-between text-[12px]/4 font-semibold">
        <span className="text-[#EF4444]">$3.30M</span>
        <span className="text-[#3B82F6]">$3.61M</span>
      </div>
      <div className="mt-3 flex gap-2.5">
        <SwayButton
          label="Sway Bearish"
          icon={uui.trendDown}
          className="border-[#DC2626] bg-[#DC2626]"
        />
        <SwayButton
          label="Sway Bullish"
          icon={uui.trendUp}
          className="border-[#2563EB] bg-[#3B82F6]"
          pressed={pressed}
        />
      </div>
    </div>
  )
}

function SwayButton({
  label,
  icon,
  className,
  pressed,
}: {
  label: string
  icon: string
  className: string
  pressed?: boolean
}) {
  return (
    <span
      className={`relative flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full border text-[15px] font-semibold tracking-[-0.41px] text-white shadow-[0_1px_1px_rgba(24,24,27,.24),inset_0_1px_0_rgba(255,255,255,.2)] transition-[scale,opacity] ease-[cubic-bezier(.33,1,.68,1)] before:absolute before:inset-0 before:rounded-full before:bg-linear-to-b before:from-white/16 before:to-transparent ${pressed ? 'scale-[.985] opacity-92 duration-120' : 'duration-220'} ${className}`}
    >
      {label}
      <Icon d={icon} className="size-[15px]" />
    </span>
  )
}

/* ─── Cerebro · Portfolio Breakdown donut (apps/web chart-utils.tsx, recharts) ─── */

const SLICES: [number, string][] = [
  [79.94, '#06B6D4'],
  [4.68, '#10B981'],
  [3.69, '#EC4899'],
  [3.39, '#6366F1'],
  [2.57, '#FF6B42'],
  [1.46, '#C964F2'],
  [4.27, '#75767F'],
]
// innerRadius 80%, outerRadius 90%, paddingAngle 3, from 3 o'clock counter-clockwise.
const OUTER = 108 * 0.9
const INNER = 108 * 0.8

/**
 * An annular slice from angle a0 to a1 (degrees, counter-clockwise from 3 o'clock) with its four
 * corners rounded like recharts' cornerRadius="25%": a quarter of the ring's thickness, shrunk on
 * slices too thin to hold it.
 */
function sector(r0: number, r1: number, a0: number, a1: number) {
  const rad = Math.PI / 180
  const p = (r: number, a: number) =>
    `${(108 + r * Math.cos(-a * rad)).toFixed(2)},${(108 + r * Math.sin(-a * rad)).toFixed(2)}`
  const cr = Math.min((r1 - r0) * 0.25, ((a1 - a0) * rad * r0) / 2)
  if (cr < 0.05) {
    const big = a1 - a0 > 180 ? 1 : 0
    return `M${p(r1, a0)} A${r1},${r1} 0 ${big} 0 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${big} 1 ${p(r0, a0)} Z`
  }
  // Each corner circle touches the slice edge and the arc: these are its angle off the edge and
  // how far along the edge it meets it.
  const dOut = Math.asin(cr / (r1 - cr)) / rad
  const dIn = Math.asin(cr / (r0 + cr)) / rad
  const eOut = Math.sqrt((r1 - cr) ** 2 - cr ** 2)
  const eIn = Math.sqrt((r0 + cr) ** 2 - cr ** 2)
  const bigOut = a1 - a0 - 2 * dOut > 180 ? 1 : 0
  const bigIn = a1 - a0 - 2 * dIn > 180 ? 1 : 0
  const c = `A${cr},${cr} 0 0 0`
  return [
    `M${p(eOut, a0)}`,
    `${c} ${p(r1, a0 + dOut)}`,
    `A${r1},${r1} 0 ${bigOut} 0 ${p(r1, a1 - dOut)}`,
    `${c} ${p(eOut, a1)}`,
    `L${p(eIn, a1)}`,
    `${c} ${p(r0, a1 - dIn)}`,
    `A${r0},${r0} 0 ${bigIn} 1 ${p(r0, a0 + dIn)}`,
    `${c} ${p(eIn, a0)}`,
    'Z',
  ].join(' ')
}
/** Slice paths at `sweep` of the mount sweep, with the selected slice thickened inward by `grow`×12px. */
function donut(sweep: number, grow: number) {
  const total = SLICES.reduce((s, [v]) => s + v, 0)
  const avail = 360 - 3 * SLICES.length
  let a = 0
  return SLICES.map(([v], i) => {
    const span = (avail * v) / total
    const a0 = a * sweep
    const a1 = (a + span) * sweep
    a += span + 3
    return sector(i === 0 ? INNER - 12 * grow : INNER, OUTER, a0, Math.max(a1, a0 + 0.01))
  })
}

function Cerebro({ on }: { on: boolean }) {
  const svg = useRef<SVGSVGElement>(null)
  const state = useRef({ sweep: 0, grow: 0 })
  const draw = (next: Partial<typeof state.current>) => {
    Object.assign(state.current, next)
    const ds = donut(state.current.sweep, state.current.grow)
    for (const [i, p] of (svg.current?.querySelectorAll('path') ?? []).entries())
      p.setAttribute('d', ds[i])
  }
  // Mount sweep 300ms ease-out; the selected slice (USDC) grows over 300ms easeOutCubic alongside.
  useTimeline(
    on,
    (reduced) => [
      tween(reduced, 300, 60, cssEaseOut, state.current.sweep, 1, (sweep) => draw({ sweep })),
      tween(reduced, 300, 60, easeOutCubic, state.current.grow, 1, (grow) => draw({ grow })),
    ],
    // Out: the same animation run back, as recharts does when the data empties.
    (reduced) => [
      tween(reduced, 300, 0, cssEaseOut, state.current.sweep, 0, (sweep) => draw({ sweep })),
      tween(reduced, 300, 0, easeOutCubic, state.current.grow, 0, (grow) => draw({ grow })),
    ],
  )

  return (
    <div className="relative h-full bg-[#121216] font-sans">
      <div className="absolute top-2 left-2 h-[280px] w-[420px] rounded-2xl border border-white/6 bg-[#19191D]" />
      <svg
        ref={svg}
        aria-hidden
        viewBox="0 0 216 216"
        className="absolute top-3 left-5 size-[216px]"
      >
        {donut(0, 0).map((d, i) => (
          <path key={SLICES[i][1]} d={d} fill={SLICES[i][1]} />
        ))}
      </svg>
      <div className="absolute top-3 left-5 flex size-[216px] flex-col items-center justify-center gap-1.5">
        <span className="text-[13px] font-medium text-[#848590]">USDC</span>
        <span className="font-mono text-[20px] font-medium tracking-[-0.01em] text-white">
          $106,198.94
        </span>
        <span className="rounded-3xl bg-[#29F596]/10 px-2 py-1.5 font-mono text-[13px] leading-none text-[#29F596]">
          79.94%
        </span>
      </div>
      <div className="absolute top-11 left-[252px] flex w-[124px] flex-col gap-1">
        {(
          [
            ['USDC', '79.94%'],
            ['ZEC', '4.68%'],
            ['LIT', '3.69%'],
            ['Key of…', '3.39%'],
            ['VVV', '2.57%'],
          ] as const
        ).map(([name, pct], i) => (
          <div
            key={name}
            className={`flex items-center gap-2 rounded-lg px-2 py-[7px] text-[13px] text-white ${i === 0 ? 'bg-white/5' : ''}`}
          >
            <i className="size-3 shrink-0 rounded-[3px]" style={{ background: SLICES[i][1] }} />
            {name}
            <b className="ml-auto font-mono text-[12px] font-normal">{pct}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── BenKon · Operation Configuration screen of the admin dashboard, from screenshots ─── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAYS = 5

/**
 * No source to read the motion from, so it is plain: the weekend days are picked one after the
 * other, then Auto ON is switched on, each a 150ms colour change and a 200ms knob slide.
 */
function BenKon({ on }: { on: boolean }) {
  const [days, setDays] = useState(WEEKDAYS)
  const [auto, setAuto] = useState(false)
  useTimeline(
    on,
    (reduced) => [
      later(reduced, 200, () => setDays(6)),
      later(reduced, 330, () => setDays(7)),
      later(reduced, 520, () => setAuto(true)),
    ],
    // Out in reverse, while the logo closes over it.
    (reduced) => [
      later(reduced, 0, () => setAuto(false)),
      later(reduced, 120, () => setDays(6)),
      later(reduced, 220, () => setDays(WEEKDAYS)),
    ],
  )
  const field = 'flex flex-col gap-1 text-[13px] font-medium'
  const input =
    'h-[34px] w-[150px] rounded-md border border-[#D1D5DB] px-3 text-[14px] leading-[32px] font-normal'
  return (
    <div className="h-full bg-white px-5 pt-[18px] font-[family-name:Lexend,var(--font-sans)] text-[#111827]">
      <div className="text-[18px]">Operating Hours</div>
      <div className="mt-3.5 flex gap-3">
        <span className={field}>
          Start Time
          <span className={input}>06:00</span>
        </span>
        <span className={field}>
          End Time
          <span className={input}>23:30</span>
        </span>
      </div>
      <div className="mt-3.5 text-[12px] font-medium">Repeat Days:</div>
      <div className="mt-1.5 flex gap-1.5">
        {DAYS.map((d, i) => (
          <span
            key={d}
            className={`h-[22px] rounded-full px-[9px] text-[12px] leading-[22px] transition-colors duration-150 motion-reduce:transition-none ${i < days ? 'bg-[#4589DF] text-white' : 'bg-[#EEF2F7] text-[#6B7280]'}`}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center rounded-md border border-[#E5E7EB] px-3.5 py-3 text-[15px] font-semibold">
        Auto ON
        <span
          className={`relative ml-auto h-[18px] w-[38px] rounded-full transition-colors duration-150 motion-reduce:transition-none ${auto ? 'bg-[#4589DF]' : 'bg-[#E5E7EB]'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 size-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none ${auto ? 'translate-x-5' : ''}`}
          />
        </span>
        <span className="ml-2.5 text-[13px] font-normal">Activate ?</span>
      </div>
    </div>
  )
}

/* ─── GreenMaster Go · "Loại dịch vụ" sheet (gmg-mobile ServiceTypesField.tsx) ─── */

const TILES = [
  [gmg.mouse, 'Chuột', '0 0 24 24'],
  [gmg.fly, 'Côn trùng', '0 0 24 24'],
  [gmg.termite, 'Mối', '0 0 24 24'],
  [gmg.spray, 'Khử khuẩn', '-4 0 24 24'],
] as const

function GreenMaster({ on }: { on: boolean }) {
  const [up, setUp] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [picked, setPicked] = useState(false)
  // Sheet: @gorhom/bottom-sheet's Android default, 250ms Easing.out(exp). The tile is a
  // TouchableOpacity (activeOpacity 0.7) and flips to selected instantly, as in the app.
  useTimeline(
    on,
    (reduced) => [
      later(reduced, 0, () => setUp(true)),
      later(reduced, 380, () => setPressed(!reduced)),
      later(reduced, 500, () => {
        setPressed(false)
        setPicked(true)
      }),
    ],
    // Out: the sheet is dismissed with the same 250ms curve, then the pick is cleared off-screen.
    // It waits 100ms, so it leaves while the logo closes over it instead of baring the backdrop.
    (reduced) => [
      later(reduced, 0, () => setPressed(false)),
      later(reduced, 100, () => setUp(false)),
      later(reduced, 360, () => setPicked(false)),
    ],
  )
  return (
    <div className="relative h-full bg-[#E7E8EA] font-[family-name:Lexend,var(--font-sans)]">
      <div
        className={`absolute inset-x-0 top-9 h-[260px] rounded-t-3xl bg-white px-7 pt-[22px] shadow-[0_-4px_20px_rgba(0,0,0,.1)] transition-transform duration-250 ease-[cubic-bezier(.19,1,.22,1)] motion-reduce:transition-none ${up ? 'translate-y-0 delay-50' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between text-[18px] font-medium text-[#4B5563]">
          Loại dịch vụ
          <span className="grid size-8 place-items-center rounded-full bg-[#F9FAFB] text-[#A4A7AE]">
            <Icon d={uui.xClose} className="size-5" />
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {TILES.map(([d, label, viewBox], i) => {
            const sel = i === 0 && picked
            return (
              <div
                key={label}
                className={`flex w-[calc(50%-6px)] flex-col gap-5 rounded-xl border p-4 transition-opacity ${sel ? 'border-[#115C32]/50' : 'border-[#F3F4F6]'} ${i === 0 && pressed ? 'opacity-70 duration-150' : 'duration-250'}`}
              >
                <Icon
                  d={[...d]}
                  viewBox={viewBox}
                  strokeWidth={1.5}
                  className="size-[30px] text-[#535862]"
                />
                <div className="flex items-center justify-between text-[16px] font-medium text-[#111827]">
                  {label}
                  {sel ? (
                    <Icon d={gmg.check} strokeWidth={3} className="size-4 text-[#008000]" />
                  ) : (
                    <Icon
                      d={gmg.ring}
                      strokeWidth={3}
                      caps="butt"
                      className="size-4 text-[#A4A7AE]"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const DETAILS: Record<string, (props: { on: boolean }) => ReactNode> = {
  sway: Sway,
  cerebro: Cerebro,
  benkon: BenKon,
  greenmaster: GreenMaster,
}

/** True if the project has a detail for its thumbnail to wipe to. */
export const hasWorkDetail = (slug: string) => slug in DETAILS

/**
 * The project's app detail, plays while `on`. It is laid out at 384×240; `className` scales it into
 * its box, by default a 128×80 thumb (96×64 on phones).
 */
export function WorkDetail({
  slug,
  on,
  className = 'scale-[calc(1/3)] max-sm:scale-[calc(64/240)]',
}: {
  slug: string
  on: boolean
  className?: string
}) {
  const Detail = DETAILS[slug]
  if (!Detail) return null
  return (
    // Hidden once the logo has closed over it (300ms): a light detail under the canvas otherwise
    // shows through the anti-aliased rounded corners as a bright rim.
    <div
      aria-hidden
      className={`absolute top-0 left-0 h-[240px] w-[384px] origin-top-left overflow-hidden ${on ? '' : 'invisible transition-[visibility] delay-300'} ${className}`}
    >
      <Detail on={on} />
    </div>
  )
}
