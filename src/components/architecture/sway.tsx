import { type CSSProperties, useEffect, useRef, useState } from 'react'
import NumberFlow from '@/components/number-flow'
import {
  ArchFigure,
  clamp,
  curve,
  Detail,
  Dot,
  ease,
  LIVE_FILL,
  MINE,
  NARROW,
  Swap,
  Track,
  textIn,
  useFigureClock,
  useSelection,
  watchLayout,
  wave,
} from './shared'

// Variant A (node map) from design/architecture/sway/index.html, built like the Cerebro figure:
// HTML cards in a grid, and an SVG layer on top whose edges are measured from the cards. Public
// labels only: no internal service names, vendors or workarounds.

type Who = 'me' | 'co' | 'worked' | 'team' | 'ext'
const WHO: Record<Who, string> = {
  me: 'built by me',
  co: 'co-built',
  worked: 'worked on',
  team: 'built by the team',
  ext: 'external',
}
const isMine = (who: Who) => who === 'me' || who === 'co'

const NODES = {
  story: {
    lab: 'Story pipeline',
    sub: 'news to cards',
    who: 'team',
    tip: 'Reads the news, decides what is worth a card, and writes it for the feed.',
  },
  price: {
    lab: 'Price feed',
    sub: 'live prices',
    who: 'me',
    tip: 'One live exchange connection shared by every phone, so prices never spend the request budget.',
  },
  phone: {
    lab: 'Phone app',
    sub: 'swipe a side',
    who: 'worked',
    tip: 'Swipe a story, pick Bullish or Bearish. I built the positions, orders and alerts screens.',
  },
  api: {
    lab: 'API',
    sub: 'orders, alerts',
    who: 'worked',
    tip: 'Places orders, logs trades, sends alerts, splits fees. I built the fills, alerts and rewards parts.',
  },
  gw: {
    lab: 'Rate-limit gateway',
    sub: 'trading first',
    who: 'me',
    tip: 'Shares the exchange’s request budget by cost and keeps a lane for trades, so a sync never holds an order back.',
  },
  hl: {
    lab: 'Hyperliquid',
    sub: 'perp exchange',
    who: 'ext',
    tip: 'The exchange where the trade actually happens.',
  },
  fill: {
    lab: 'Fill stream',
    sub: 'fill to user',
    who: 'co',
    tip: 'Keeps the fills from Sway wallets and hands each to its owner. Saved first, so a retry never counts twice.',
  },
  rew: {
    lab: 'Rewards contract',
    sub: 'fees on-chain',
    who: 'me',
    tip: 'Holds each creator and referrer share of trading fees until they claim it. Paid out in batches.',
  },
} satisfies Record<string, { lab: string; sub: string; who: Who; tip: string }>
type NodeId = keyof typeof NODES
const NODE_IDS = Object.keys(NODES) as NodeId[]

const HOPS = [
  'cards',
  'order',
  'push',
  'lane',
  'send',
  'fill',
  'match',
  'fees',
  'claim',
  'ticks',
  'prices',
  'mark',
] as const
type Hop = (typeof HOPS)[number]

const GRID = {
  wide: {
    gridTemplateColumns: 'repeat(3, minmax(0,1fr)) minmax(0,0.85fr)',
    gridTemplateAreas: '". story price ." "phone api gw hl" "rew . fill ."',
    gap: '64px 44px',
  },
  // Narrower than NARROW the map stacks in two columns and drops the claim and mark edges.
  narrow: {
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gridTemplateAreas: '"phone story" "api fill" "gw hl" "rew price"',
    gap: '44px 20px',
  },
} satisfies Record<string, CSSProperties>

type Box = { l: number; r: number; t: number; b: number; cx: number; cy: number }
type Routes = { d: Partial<Record<Hop, string>>; labels: [string, number, number][] }

/** A bend from one side to another: leaves along its first direction, lands along the second. */
function bend(x1: number, y1: number, x2: number, y2: number, downFirst: boolean) {
  const dx = x2 - x1
  const dy = y2 - y1
  return downFirst
    ? `M${x1} ${y1} C${x1} ${y1 + 0.75 * dy} ${x1 + 0.3 * dx} ${y2} ${x2} ${y2}`
    : `M${x1} ${y1} C${x1 + 0.7 * dx} ${y1} ${x2} ${y1 + 0.25 * dy} ${x2} ${y2}`
}

/** Up from one top, across above everything at `top`, and down into another top. */
function over(x1: number, y1: number, x2: number, y2: number, top: number) {
  const s = Math.sign(x2 - x1) || 1
  // The corner can't be taller than the room above either end, or the line would first run
  // down into the card it leaves, then turn back up.
  const r = Math.min(24, y1 - top, y2 - top, Math.abs(x2 - x1) / 2)
  return `M${x1} ${y1} V${top + r} C${x1} ${top} ${x1} ${top} ${x1 + s * r} ${top} H${x2 - s * r} C${x2} ${top} ${x2} ${top} ${x2} ${top + r} V${y2}`
}

/** Middle of the height two side-by-side cards share, so a straight link meets both. */
const overlap = (a: Box, b: Box) => (Math.max(a.t, b.t) + Math.min(a.b, b.b)) / 2

/** Every edge and label, from the measured cards. Two layouts, same story. */
function route(n: Record<NodeId, Box>, narrow: boolean, width: number): Routes {
  const { story, price, phone, api, gw, hl, fill, rew } = n
  if (narrow) {
    const y = overlap(gw, hl)
    const my = overlap(fill, api)
    // The price line runs down the right edge, in the frame's padding, clear of the cards.
    const rx = width + 12
    const r = 10
    const top = phone.t - 16
    return {
      d: {
        order: `M${phone.cx - 24} ${phone.b} V${api.t}`,
        push: `M${api.cx + 8} ${api.t} V${phone.b}`,
        cards: curve(story.cx, story.b, api.cx + 40, api.t, false),
        lane: `M${api.cx} ${api.b} V${gw.t}`,
        send: `M${gw.r} ${y} H${hl.l}`,
        fill: `M${hl.cx} ${hl.t} V${fill.b}`,
        match: `M${fill.l} ${my} H${api.r}`,
        fees: `M${api.l} ${api.cy} C${api.l - 16} ${api.cy} ${rew.l - 16} ${rew.cy} ${rew.l} ${rew.cy}`,
        ticks: `M${hl.cx} ${hl.b} V${price.t}`,
        prices: `M${price.r} ${price.cy} H${rx - r} C${rx} ${price.cy} ${rx} ${price.cy} ${rx} ${price.cy - r} V${top + r} C${rx} ${top} ${rx} ${top} ${rx - r} ${top} H${phone.cx + r} C${phone.cx} ${top} ${phone.cx} ${top} ${phone.cx} ${top + r} V${phone.t}`,
      },
      labels: [],
    }
  }
  const oy = api.cy - 12
  const py = api.cy + 12
  const top = Math.min(story.t, price.t) - 18
  return {
    d: {
      cards: `M${story.cx - 24} ${story.b} V${api.t}`,
      mark: curve(price.cx, price.b, api.cx + 40, api.t, false),
      order: `M${phone.r} ${oy} H${api.l}`,
      push: `M${api.l} ${py} H${phone.r}`,
      lane: `M${api.r} ${api.cy} H${gw.l}`,
      send: `M${gw.r} ${hl.cy} H${hl.l}`,
      fill: bend(hl.cx, hl.b, fill.r, fill.cy, true),
      match: bend(fill.l, fill.cy, api.cx + 40, api.b, false),
      fees: bend(api.cx - 40, api.b, rew.r, rew.cy, true),
      claim: `M${rew.cx} ${rew.t} V${phone.b}`,
      ticks: bend(hl.cx, hl.t, price.r, price.cy, true),
      prices: over(price.cx - 30, price.t, phone.cx, phone.t, top),
    },
    labels: [
      ['order', phone.r + 6, oy - 6],
      ['push', phone.r + 6, py + 14],
      ['lane', api.r + 6, api.cy - 6],
      ['send', gw.r + 6, hl.cy - 6],
      ['cards', story.cx - 16, (story.b + api.t) / 2 + 4],
      ['mark', price.cx + 8, price.b + 18],
      ['ticks', hl.cx + 8, (hl.t + price.cy) / 2],
      ['fill', hl.cx + 8, (hl.b + fill.cy) / 2],
      ['matched', fill.l - 64, fill.cy + 18],
      ['fees', rew.r + 10, rew.cy + 18],
      ['claim', rew.cx + 8, (rew.t + phone.b) / 2 + 4],
      ['live prices', phone.cx + 8, (top + phone.t) / 2 + 4],
    ],
  }
}

type Stage = {
  k: string
  title: string
  body: string
  /** Edges the packet runs, in order, `ms` each. */
  hops: Hop[]
  ms: number
  /** Rest after the last hop, in ms. */
  hold?: number
  nodes: NodeId[]
  lane?: boolean
}

const STAGES: Stage[] = [
  {
    k: 'Story',
    title: 'A story becomes a card.',
    body: 'The news pipeline writes a card and the API puts it in the feed.',
    hops: ['cards'],
    ms: 600,
    nodes: ['story', 'api'],
  },
  {
    k: 'Swipe',
    title: 'Someone swipes Bullish.',
    body: 'The phone sends the order to the API, which signs it and logs it first.',
    hops: ['order'],
    ms: 500,
    nodes: ['phone', 'api'],
  },
  {
    k: 'Lane',
    title: 'Trades get the first lane.',
    body: 'The gateway charges each call its cost. Trades never wait behind a price refresh or a sync.',
    hops: ['lane'],
    ms: 500,
    nodes: ['api', 'gw'],
    lane: true,
  },
  {
    k: 'Order',
    title: 'The order lands on the exchange.',
    body: 'The gateway passes the signed order to Hyperliquid.',
    hops: ['send'],
    ms: 500,
    hold: 400,
    nodes: ['gw', 'hl'],
  },
  {
    k: 'Fill',
    title: 'The fill streams back.',
    body: 'Hyperliquid publishes every trade; the fill stream is listening.',
    hops: ['fill'],
    ms: 700,
    nodes: ['hl', 'fill'],
  },
  {
    k: 'Match',
    title: 'Each fill finds its owner.',
    body: 'Only fills from Sway wallets are kept, saved before anything else, then handed to the API.',
    hops: ['match'],
    ms: 500,
    nodes: ['fill', 'api'],
  },
  {
    k: 'Notify',
    title: 'A push says it filled.',
    body: 'The API completes the trade with price and fees and tells the phone.',
    hops: ['push'],
    ms: 500,
    hold: 500,
    nodes: ['api', 'phone'],
  },
  {
    k: 'Reward',
    title: 'Fees settle on-chain.',
    body: 'Each fee share is batched into the rewards contract, where creators and referrers claim it.',
    hops: ['fees', 'claim'],
    ms: 600,
    nodes: ['api', 'rew', 'phone'],
  },
]

// One clock in ms drives everything: stage i runs from starts[i] to stageEnd(i), then a GAP.
const GAP = 250
const REST = 1200
const TICK_EVERY = 1400
const starts: number[] = []
let LOOP = 0
for (const s of STAGES) {
  starts.push(LOOP)
  LOOP += s.hops.length * s.ms + (s.hold ?? 0) + GAP
}
const stageEnd = (i: number) =>
  starts[i] + STAGES[i].hops.length * STAGES[i].ms + (STAGES[i].hold ?? 0)
const LAST_END = stageEnd(STAGES.length - 1) + GAP
LOOP += REST
/** When the fees hop reaches the contract and the claimable amount goes up. */
const FEES_LAND = starts[STAGES.length - 1] + STAGES[STAGES.length - 1].ms

const stageAt = (t: number) => {
  let i = 0
  while (i + 1 < starts.length && t >= starts[i + 1]) i++
  return i
}
const FADE = 150 // ms the packet takes to appear on a path and to leave it

// Edges outside the order's round trip, so selecting their nodes (price feed) still lights them.
const AMBIENT: { nodes: NodeId[]; hops: Hop[] }[] = [
  { nodes: ['hl', 'price'], hops: ['ticks'] },
  { nodes: ['price', 'phone'], hops: ['prices'] },
  { nodes: ['price', 'api'], hops: ['mark'] },
]

type View = {
  stage: number
  round: number
  /** Nodes the current stage's packet is passing through, space-separated. */
  active: string
  lane: boolean
  /** Price step: live prices and the sparkline move once per STEP_MS. */
  step: number
  claimed: boolean
}
const sameView = (a: View, b: View) =>
  (Object.keys(a) as (keyof View)[]).every((k) => a[k] === b[k])

// What the nodes show. Sample data: no real wallets, users or prices.
const HEADLINES = ['ETF inflows surge', 'New L2 goes live', 'Fed holds rates']
const API_LOG = [
  'card → feed',
  'order signed',
  'gateway: trade',
  'sent to exchange',
  'waiting for fill',
  'fill → trade 4812',
  'push → phone',
  'fee share batched',
]
const FILLS = ['0x91…7c SOL short', '0xa4…e2 BTC long', '0x5d…09 ETH short']
const SWAY_FILL = '0x3f…a1 ETH long'
const CLAIM = [12.4, 12.82]
const SPARK_POINTS = 24
const STEP_MS = 700

const sparkPoints = (step: number) =>
  Array.from(
    { length: SPARK_POINTS },
    (_, i) => `${((i * 100) / (SPARK_POINTS - 1)).toFixed(1)},${(12 - wave(step + i)).toFixed(1)}`,
  ).join(' ')
const ethPrice = (step: number) => Math.round((3412.5 + wave(step) * 0.8) * 10) / 10

/** Sway: how an order makes the round trip. Hover, focus or tap a part for what it does. */
export function SwayArchitecture() {
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLButtonElement>>>({})
  const barRefs = useRef<HTMLElement[]>([])
  // Reduced motion: a still of the order on the exchange, stepped by hand.
  const { reduce, clock, renderRef, playing, setPlaying, speed, setSpeed } = useFigureClock(
    frameRef,
    {
      still: stageEnd(3),
      ambient: true,
    },
  )
  const [narrow, setNarrow] = useState(false)
  const [routes, setRoutes] = useState<Routes>({ d: {}, labels: [] })
  const [view, setView] = useState<View>({
    stage: 0,
    round: 0,
    active: '',
    lane: false,
    step: 0,
    claimed: false,
  })
  const { sel, bind } = useSelection<NodeId>(stageRef)

  // Measure the cards and route the edges between them.
  useEffect(() => {
    const stage = stageRef.current
    const frame = frameRef.current
    if (!stage || !frame) return
    const measure = () => {
      const isNarrow = frame.clientWidth < NARROW
      setNarrow(isNarrow)
      const S = stage.getBoundingClientRect()
      const boxes = {} as Record<NodeId, Box>
      for (const id of NODE_IDS) {
        const r = nodeRefs.current[id]?.getBoundingClientRect()
        if (!r) return
        const l = r.left - S.left
        const t = r.top - S.top
        boxes[id] = {
          l,
          t,
          r: l + r.width,
          b: t + r.height,
          cx: l + r.width / 2,
          cy: t + r.height / 2,
        }
      }
      setRoutes(route(boxes, isNarrow, S.width))
    }
    return watchLayout([stage, frame, ...Object.values(nodeRefs.current)], measure)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: new routes move the paths, so lengths are re-measured
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const byKey = <T extends SVGElement>(sel: string) =>
      Object.fromEntries([...svg.querySelectorAll<T>(sel)].map((e) => [e.dataset.k, e])) as Partial<
        Record<Hop, T>
      >
    const paths = byKey<SVGPathElement>('.edge')
    const trails = byKey<SVGPathElement>('.trail')
    const lens: Partial<Record<Hop, number>> = {}
    for (const [k, p] of Object.entries(paths)) lens[k as Hop] = p.getTotalLength()
    const dots = [...svg.querySelectorAll<SVGCircleElement>('.packet')]
    const ticks = [...svg.querySelectorAll<SVGCircleElement>('.tick')]
    const tickHops = (['ticks', 'prices'] as const).filter((k) => paths[k])
    const tickTotal = tickHops.reduce((a, k) => a + (lens[k] ?? 0), 0)

    const render = () => {
      const t = clock.current % LOOP
      const cur = stageAt(t)
      let head: DOMPoint | null = null
      let alpha = 1
      for (const [i, s] of STAGES.entries()) {
        for (const [j, h] of s.hops.entries()) {
          const path = paths[h]
          if (!path) continue
          const p = i > cur ? 0 : reduce && i === cur ? 1 : clamp((t - starts[i] - j * s.ms) / s.ms)
          const e = ease(p)
          trails[h]?.setAttribute('stroke-dashoffset', String(1 - e))
          if (i === cur && p > 0) {
            head = path.getPointAtLength((lens[h] ?? 0) * e)
            // Fade in as each hop starts and out as it ends (the last one in the gap after its
            // stage), so the packet never jumps from the end of one path to the start of the next.
            const t0 = starts[i] + j * s.ms
            const t1 = j === s.hops.length - 1 ? stageEnd(i) + GAP : t0 + s.ms
            alpha = reduce ? 1 : clamp(Math.min(t - t0, t1 - t) / FADE)
          }
        }
      }
      const resting = t > LAST_END
      for (const c of dots) {
        c.setAttribute('opacity', head && !resting ? String(alpha) : '0')
        if (head) {
          c.setAttribute('cx', String(head.x))
          c.setAttribute('cy', String(head.y))
        }
      }
      const fade = resting ? String(1 - clamp((t - LAST_END) / 600)) : '1'
      for (const tr of Object.values(trails)) tr.style.opacity = fade
      // Each step's bar fills over its share of the loop.
      STAGES.forEach((_, i) => {
        const bar = barRefs.current[i]
        const end = starts[i + 1] ?? LOOP
        if (bar) bar.style.width = `${clamp((t - starts[i]) / (end - starts[i])) * 100}%`
      })

      // Ambient price ticks: muted, never accent, off under reduced motion.
      ticks.forEach((c, i) => {
        if (reduce || !tickTotal) {
          c.setAttribute('opacity', '0')
          return
        }
        let d = ((performance.now() / TICK_EVERY + i / 3) % 1) * tickTotal
        let k = tickHops[0]
        if (d > (lens[k] ?? 0)) {
          d -= lens[k] ?? 0
          k = tickHops[1]
        }
        const pt = paths[k]?.getPointAtLength(d)
        if (!pt) return
        c.setAttribute('cx', String(pt.x))
        c.setAttribute('cy', String(pt.y))
        c.setAttribute('opacity', '0.6')
      })

      const s = STAGES[cur]
      const end = stageEnd(cur)
      const next: View = {
        stage: cur,
        round: Math.floor(clock.current / LOOP),
        active: !resting && t < end + GAP ? s.nodes.join(' ') : '',
        lane: !!s.lane && t < end + GAP,
        step: reduce ? 0 : Math.floor(performance.now() / STEP_MS),
        claimed: t >= FEES_LAND,
      }
      setView((v) => (sameView(v, next) ? v : next))
    }
    renderRef.current = render
    render()
  }, [routes, reduce, clock, renderRef])

  // Playing: run from the step's start. Paused: show it done, with the packet at the far end.
  const jump = (i: number) => {
    clock.current += (playing ? starts[i] : stageEnd(i)) - (clock.current % LOOP)
    renderRef.current?.()
  }

  const relStages = sel ? [...STAGES, ...AMBIENT].filter((s) => s.nodes.includes(sel)) : []
  const relNodes = new Set(relStages.flatMap((s) => s.nodes))
  const relEdges = new Set(relStages.flatMap((s) => s.hops))
  const active = new Set(view.active.split(' '))
  const stage = STAGES[view.stage]
  const n = sel && NODES[sel]
  const edges = HOPS.filter((h) => routes.d[h])

  return (
    <ArchFigure
      title="How an order makes the round trip"
      mineLabel="built or co-built by me"
      narrow={narrow}
      frameRef={frameRef}
    >
      <div ref={stageRef} className={`relative ${narrow ? 'pt-4' : 'pt-6'}`}>
        <div className="grid items-center" style={GRID[narrow ? 'narrow' : 'wide']}>
          {NODE_IDS.map((id) => {
            const node = NODES[id]
            const live = active.has(id)
            const on = live || sel === id
            return (
              <button
                key={id}
                ref={(el) => {
                  if (el) nodeRefs.current[id] = el
                }}
                type="button"
                data-node={id}
                aria-label={`${node.lab}, ${WHO[node.who]}`}
                aria-describedby="sway-arch-detail"
                {...bind(id)}
                style={{
                  gridArea: id,
                  background: live
                    ? LIVE_FILL
                    : node.who === 'ext'
                      ? 'var(--color-well)'
                      : 'var(--color-card)',
                  borderColor: on
                    ? 'var(--color-accent)'
                    : isMine(node.who)
                      ? MINE
                      : 'var(--color-edge)',
                }}
                className={`relative flex w-full min-w-0 cursor-pointer flex-col rounded-lg border px-3 pt-2.5 pb-3 text-left transition-[opacity,border-color,background-color] ease-(--ease-out) ${on ? 'duration-150' : 'duration-700'} ${sel && !relNodes.has(id) ? 'opacity-35' : ''}`}
              >
                {/* Long names wrap rather than truncate in the narrow layout. */}
                <span className="flex items-start justify-between gap-2">
                  <span className="font-medium text-fg">{node.lab}</span>
                  {node.who !== 'ext' && (
                    <span className="flex h-[1lh] items-center">
                      <Dot mine={isMine(node.who)} />
                    </span>
                  )}
                </span>
                <span className="font-mono text-meta text-muted">{node.sub}</span>
                <span className="mt-2.5 block">
                  <NodeLive id={id} view={view} />
                </span>
              </button>
            )
          })}
        </div>
        <svg
          ref={svgRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {edges.map((k) => (
            <path
              key={k}
              d={routes.d[k]}
              data-k={k}
              className={`edge fill-none transition-[stroke,opacity] duration-150 ease-(--ease-out) ${relEdges.has(k) ? 'stroke-accent' : 'stroke-subtle/45'} ${sel && !relEdges.has(k) ? 'opacity-25' : ''}`}
            />
          ))}
          {edges.map((k) => (
            <path
              key={k}
              d={routes.d[k]}
              data-k={k}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              className="trail fill-none stroke-accent"
            />
          ))}
          {routes.labels.map(([label, x, y]) => (
            <text
              key={label}
              x={x}
              y={y}
              className={`fill-subtle font-mono text-[11px] transition-opacity duration-150 ${sel ? 'opacity-25' : ''}`}
            >
              {label}
            </text>
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} r={2} opacity={0} className="tick fill-subtle" />
          ))}
          <circle r={10} opacity={0} className="packet fill-accent/12" />
          <circle r={4} opacity={0} className="packet fill-accent" />
        </svg>
      </div>

      <Track
        playing={playing}
        onToggle={() => setPlaying(!playing)}
        speed={speed}
        onSpeed={setSpeed}
        labels={STAGES.map((s) => s.k)}
        current={view.stage}
        onJump={jump}
        onSeek={(i, f) => {
          const end = starts[i + 1] ?? LOOP
          clock.current += starts[i] + f * (end - starts[i]) - (clock.current % LOOP)
          renderRef.current?.()
        }}
        marked={new Set(STAGES.flatMap((s, i) => (sel && s.nodes.includes(sel) ? [i] : [])))}
        barRefs={barRefs}
      />
      <Detail
        domId="sway-arch-detail"
        minH={[78, 100]}
        selKey={sel}
        part={n ? { title: n.lab, mine: isMine(n.who), chip: WHO[n.who], what: n.tip } : null}
        chapter={view.stage}
        text={
          <>
            <b className="font-medium text-fg">{stage.title}</b> {stage.body}
          </>
        }
        narrow={narrow}
      />
    </ArchFigure>
  )
}

// One line each, never wrapping, so a node keeps its height whatever the log says.
const mono = 'font-mono text-[11px] leading-[16px] whitespace-nowrap'
const slide: CSSProperties = {
  transition: 'translate 240ms var(--ease-out), opacity 240ms var(--ease-out)',
}
/** A small inset card inside a node; the accent edge means it is the part in play. */
const chipCard = (on: boolean) =>
  `block truncate whitespace-nowrap rounded-md border bg-well px-2 py-1 text-[11px] leading-[18px] transition-[border-color] ease-(--ease-out) ${on ? 'border-accent duration-150' : 'border-edge duration-700'}`

/** The small live UI inside each node. It follows the stage. */
function NodeLive({ id, view }: { id: NodeId; view: View }) {
  const { stage, round, lane, step, claimed } = view
  const headline = HEADLINES[round % HEADLINES.length]
  switch (id) {
    case 'story':
      return (
        <span className={chipCard(stage === 0)}>
          <Swap k={round} className="text-fg">
            {headline}
          </Swap>
        </span>
      )
    case 'phone': {
      // The card slides right on the swipe, then turns into the order's status.
      const [label, tone] =
        stage === 0
          ? [headline, 'text-muted']
          : stage === 1
            ? ['Bullish ↗', 'text-accent']
            : stage < 6
              ? ['Order pending', 'text-muted']
              : ['✓ Filled 0.5 ETH', 'text-fg']
      return (
        <span
          className={`${chipCard(stage === 1 || stage >= 6)} mr-3`}
          style={{ ...slide, translate: stage === 1 ? '12px 0' : '0 0' }}
        >
          <Swap k={label} className={tone}>
            {label}
          </Swap>
        </span>
      )
    }
    case 'api':
      return (
        // A two-line log: each new entry pushes the last one up.
        <Swap as="span" k={stage} className={mono}>
          <span className="grid">
            <span className="truncate text-subtle">
              {stage > 0 ? API_LOG[stage - 1] : '\u00a0'}
            </span>
            <span className="truncate text-fg">{API_LOG[stage]}</span>
          </span>
        </Swap>
      )
    case 'gw':
      return (
        <>
          {/* The gateway's three request lanes; trading's lane widens while an order passes. */}
          <span className="flex h-1 gap-0.5">
            {[lane ? 66 : 55, lane ? 22 : 30, lane ? 12 : 15].map((g, i) => (
              <i
                // biome-ignore lint/suspicious/noArrayIndexKey: three fixed lanes
                key={i}
                className="block rounded-full transition-[flex-grow] duration-240 ease-(--ease-out)"
                style={{ flexGrow: g, background: `var(--color-lane-${i + 1})` }}
              />
            ))}
          </span>
          <Swap k={String(lane)} className={`mt-2 ${mono} ${lane ? 'text-accent' : 'text-subtle'}`}>
            {lane ? 'trade → lane 1' : 'prices · sync'}
          </Swap>
        </>
      )
    case 'hl':
      return (
        <span className={`grid ${mono}`}>
          <span className="text-muted tabular-nums">
            ETH <NumberFlow value={ethPrice(step)} format={{ minimumFractionDigits: 1 }} />
          </span>
          <Swap
            k={stage < 3 ? 0 : Math.min(stage, 4)}
            className={stage === 3 ? 'text-accent' : stage > 3 ? 'text-fg' : 'text-subtle'}
          >
            {stage < 3 ? 'book live' : stage === 3 ? 'order in book' : 'filled @ 3,412'}
          </Swap>
        </span>
      )
    case 'fill': {
      // A new fill slides in on top; on match, everything that isn't a Sway wallet fades.
      const rows = stage >= 4 ? [SWAY_FILL, ...FILLS.slice(0, 2)] : FILLS
      return (
        <span className={`relative block h-12 ${mono}`}>
          {rows.map((r, i) => {
            const mine = r === SWAY_FILL
            return (
              <span
                key={r}
                className={`absolute inset-x-0 top-0 truncate ${mine ? 'text-accent' : 'text-muted'} ${mine && stage === 4 ? textIn : ''}`}
                style={{
                  ...slide,
                  translate: `0 ${i * 16}px`,
                  opacity: stage >= 5 && !mine ? 0.35 : 1,
                }}
              >
                {mine && stage >= 5 ? `✓ ${r}` : r}
              </span>
            )
          })}
        </span>
      )
    }
    case 'rew':
      return (
        <span className="grid">
          <span className={`${mono} text-subtle`}>claimable</span>
          <span className="text-[17px] font-medium text-fg tabular-nums">
            <NumberFlow
              value={claimed ? CLAIM[1] : CLAIM[0]}
              format={{ style: 'currency', currency: 'USD' }}
            />
          </span>
        </span>
      )
    case 'price':
      return (
        <svg
          aria-hidden
          viewBox="-1 -1 102 26"
          preserveAspectRatio="none"
          className="block h-6 w-full"
        >
          <polyline
            points={sparkPoints(step)}
            className="fill-none stroke-muted [vector-effect:non-scaling-stroke]"
          />
        </svg>
      )
  }
}
