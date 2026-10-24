import { useEffect, useRef, useState } from 'react'
import {
  ArchFigure,
  clamp,
  Detail,
  ease,
  LIVE_FILL,
  MINE,
  NARROW,
  Swap,
  Track,
  textIn,
  useFigureClock,
  useSelection,
  wave,
} from './shared'

// Port of design/architecture/sway/index.html (variant A, node map). Public labels only: no
// internal service names, vendors or workarounds.

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

const WIDE_EDGES = {
  cards: 'M348 120 V192',
  order: 'M212 228 H260',
  push: 'M260 252 H212',
  lane: 'M436 240 H484',
  send: 'M660 240 H700',
  fill: 'M772 288 C772 390 738 424 660 424',
  match: 'M484 424 C426 424 400 390 400 288',
  fees: 'M312 288 C312 400 290 448 212 448',
  claim: 'M124 372 V288',
  ticks: 'M772 192 C772 104 740 72 660 72',
  prices: 'M528 24 C528 10 506 8 476 8 H176 C140 8 124 28 124 70 V192',
  mark: 'M548 120 C548 160 420 152 420 192',
}
type Hop = keyof typeof WIDE_EDGES

type Layout = {
  vb: [number, number]
  /** x, y, w, h in viewBox units. */
  nodes: Record<NodeId, [number, number, number, number]>
  edges: Partial<Record<Hop, string>>
  labels: [string, number, number][]
}

// Narrower than NARROW, the map stacks; it drops the edge labels and the claim and mark edges.
const LAYOUTS: Record<'wide' | 'narrow', Layout> = {
  wide: {
    vb: [880, 500],
    nodes: {
      story: [260, 24, 176, 96],
      price: [484, 24, 176, 96],
      phone: [36, 192, 176, 96],
      api: [260, 192, 176, 96],
      gw: [484, 190, 176, 100],
      hl: [700, 192, 144, 96],
      fill: [484, 372, 176, 104],
      rew: [36, 372, 176, 104],
    },
    edges: WIDE_EDGES,
    labels: [
      ['order', 218, 222],
      ['push', 220, 268],
      ['lane', 442, 234],
      ['send', 666, 234],
      ['fill', 780, 356],
      ['matched', 418, 360],
      ['fees', 236, 466],
      ['claim', 132, 336],
      ['cards', 356, 162],
      ['live prices', 134, 100],
      ['mark', 556, 146],
      ['ticks', 780, 140],
    ],
  },
  narrow: {
    vb: [360, 624],
    nodes: {
      phone: [16, 16, 150, 96],
      story: [194, 16, 150, 96],
      api: [16, 168, 150, 96],
      fill: [194, 168, 150, 104],
      gw: [16, 338, 150, 100],
      hl: [194, 340, 150, 96],
      rew: [16, 504, 150, 104],
      price: [194, 504, 150, 96],
    },
    edges: {
      order: 'M60 112 V168',
      push: 'M110 168 V112',
      cards: 'M269 112 C269 146 130 134 130 168',
      lane: 'M91 264 V338',
      send: 'M166 388 H194',
      fill: 'M269 340 V272',
      match: 'M194 216 H166',
      fees: 'M16 240 C-4 240 -4 556 16 556',
      ticks: 'M269 436 V504',
      prices: 'M344 552 C356 552 356 540 356 510 V50 C356 18 340 6 310 6 H130 C102 6 91 10 91 16',
    },
    labels: [],
  },
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
}

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
const STEP_MS = 700 // live prices and the sparkline move once per step

const sparkPoints = (step: number, x: number, y: number, w: number) =>
  Array.from(
    { length: SPARK_POINTS },
    (_, i) =>
      `${(x + (i * w) / (SPARK_POINTS - 1)).toFixed(1)},${(y + 12 - wave(step + i)).toFixed(1)}`,
  ).join(' ')
const ethPrice = (step: number) =>
  (3412.5 + wave(step) * 0.8).toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
/** Sway: how an order makes the round trip. Hover, focus or tap a part for what it does. */
export function SwayArchitecture() {
  const frameRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const barRefs = useRef<HTMLElement[]>([])
  // Reduced motion: a still of the order on the exchange, stepped by hand.
  const { reduce, clock, renderRef, playing, setPlaying } = useFigureClock(frameRef, {
    still: stageEnd(3),
    ambient: true,
  })
  const [layout, setLayout] = useState<'wide' | 'narrow'>('wide')
  const [view, setView] = useState<View>({ stage: 0, round: 0, active: '', lane: false })
  const { sel, bind } = useSelection<NodeId>(svgRef)
  const L = LAYOUTS[layout]

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setLayout(el.clientWidth < NARROW ? 'narrow' : 'wide'))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new layout swaps the paths, so lengths are re-measured
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
    const live = (k: string) => svg.querySelector<SVGElement>(`[data-live=${k}]`)
    const px = live('px')
    const spark = live('spark')
    const claim = live('claim')

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

      // Live readouts: prices step on their own, the claimable amount grows when fees land.
      const step = reduce ? 0 : Math.floor(performance.now() / STEP_MS)
      const set = (el: SVGElement | null, text: string) => {
        if (el && el.textContent !== text) el.textContent = text
      }
      set(px, ethPrice(step))
      if (spark) {
        const { x, y, w } = spark.dataset
        const pts = sparkPoints(step, Number(x), Number(y), Number(w))
        if (spark.getAttribute('points') !== pts) spark.setAttribute('points', pts)
      }
      if (claim) {
        const last = STAGES.length - 1
        const landed = starts[last] + STAGES[last].ms // the fees hop has reached the contract
        const p = t < starts[last] ? 0 : reduce ? 1 : ease(clamp((t - landed) / 400))
        set(claim, `$${(CLAIM[0] + (CLAIM[1] - CLAIM[0]) * p).toFixed(2)}`)
      }

      const s = STAGES[cur]
      const end = stageEnd(cur)
      const next: View = {
        stage: cur,
        round: Math.floor(clock.current / LOOP),
        active: !resting && t < end + GAP ? s.nodes.join(' ') : '',
        lane: !!s.lane && t < end + GAP,
      }
      setView((v) =>
        v.stage === next.stage &&
        v.active === next.active &&
        v.round === next.round &&
        v.lane === next.lane
          ? v
          : next,
      )
    }
    renderRef.current = render
    render()
  }, [layout, reduce, clock, renderRef])

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
  const narrow = layout === 'narrow'
  const n = sel && NODES[sel]

  return (
    <ArchFigure
      title="How an order makes the round trip"
      mineLabel="built or co-built by me"
      narrow={narrow}
      frameRef={frameRef}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: an <svg> can't be a <fieldset>; role="img" would hide the node buttons inside */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
        role="group"
        aria-label="Sway system map: phone app, API, rate-limit gateway, Hyperliquid, fill stream, price feed, story pipeline and rewards contract"
        className="block h-auto w-full overflow-visible"
      >
        <g>
          {Object.entries(L.edges).map(([k, d]) => (
            <path
              key={k}
              d={d}
              data-k={k}
              className={`edge fill-none transition-[stroke,opacity] duration-150 ease-(--ease-out) [vector-effect:non-scaling-stroke] ${relEdges.has(k as Hop) ? 'stroke-accent' : 'stroke-subtle/45'} ${sel && !relEdges.has(k as Hop) ? 'opacity-25' : ''}`}
            />
          ))}
        </g>
        <g>
          {Object.entries(L.edges).map(([k, d]) => (
            <path
              key={k}
              d={d}
              data-k={k}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              className="trail fill-none stroke-accent [vector-effect:non-scaling-stroke]"
            />
          ))}
        </g>
        {L.labels.map(([label, x, y]) => (
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
        {NODE_IDS.map((id) => {
          const node = NODES[id]
          const [x, y, w, h] = L.nodes[id]
          const on = active.has(id) || sel === id
          return (
            // biome-ignore lint/a11y/useSemanticElements: an SVG group can't be a <button>
            <g
              key={id}
              {...bind(id)}
              data-node={id}
              tabIndex={0}
              role="button"
              aria-label={`${node.lab}, ${WHO[node.who]}`}
              aria-describedby="sway-arch-detail"
              className={`group cursor-pointer outline-none transition-opacity duration-150 ease-(--ease-out) ${sel && !relNodes.has(id) ? 'opacity-35' : ''}`}
            >
              <rect
                x={x + 0.5}
                y={y + 0.5}
                width={w - 1}
                height={h - 1}
                rx={8}
                className={`transition-[fill,stroke] ease-(--ease-out) [vector-effect:non-scaling-stroke] group-focus-visible:[stroke-width:2] ${on ? 'duration-150' : 'duration-700'}`}
                style={{
                  fill: active.has(id)
                    ? LIVE_FILL
                    : node.who === 'ext'
                      ? 'var(--color-well)'
                      : 'var(--color-card)',
                  stroke: on
                    ? 'var(--color-accent)'
                    : isMine(node.who)
                      ? MINE
                      : 'var(--color-edge)',
                }}
              />
              <text x={x + 12} y={y + 24} className="fill-fg text-[13px] font-medium">
                {node.lab}
              </text>
              <text x={x + 12} y={y + 41} className="fill-muted font-mono text-[12px]">
                {node.sub}
              </text>
              {isMine(node.who) ? (
                <circle cx={x + w - 15} cy={y + 20} r={3} className="fill-accent" />
              ) : (
                node.who !== 'ext' && (
                  <circle
                    cx={x + w - 15}
                    cy={y + 20}
                    r={2.5}
                    className="fill-none stroke-subtle [vector-effect:non-scaling-stroke]"
                  />
                )
              )}
              <NodeLive id={id} x={x + 12} y={y + 54} w={w - 24} view={view} />
            </g>
          )
        })}
        <circle r={10} opacity={0} className="packet fill-accent/12" />
        <circle r={4} opacity={0} className="packet fill-accent" />
      </svg>

      <Track
        playing={playing}
        onToggle={() => setPlaying(!playing)}
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

const mono = 'font-mono text-[11px]'
const slide = { transition: 'transform 240ms var(--ease-out), opacity 240ms var(--ease-out)' }

/** The small live UI inside each node, starting at (x, y), `w` wide. It follows the stage. */
function NodeLive({
  id,
  x,
  y,
  w,
  view,
}: {
  id: NodeId
  x: number
  y: number
  w: number
  view: View
}) {
  const { stage, round, lane } = view
  const headline = HEADLINES[round % HEADLINES.length]
  switch (id) {
    case 'story':
      return (
        <g>
          <rect
            x={x + 0.5}
            y={y + 0.5}
            width={w - 1}
            height={27}
            rx={6}
            className={`fill-well transition-[stroke] [vector-effect:non-scaling-stroke] ${stage === 0 ? 'stroke-accent duration-150' : 'stroke-edge duration-700'}`}
          />
          <Swap as="g" k={round}>
            <text x={x + 8} y={y + 18} className="fill-fg text-[11px]">
              {headline}
            </text>
          </Swap>
        </g>
      )
    case 'phone': {
      // The card slides right on the swipe, then turns into the order's status.
      const [label, tone] =
        stage === 0
          ? [headline, 'fill-muted']
          : stage === 1
            ? ['Bullish ↗', 'fill-accent']
            : stage < 6
              ? ['Order pending', 'fill-muted']
              : ['✓ Filled 0.5 ETH', 'fill-fg']
      return (
        <g style={{ ...slide, transform: `translateX(${stage === 1 ? 12 : 0}px)` }}>
          <rect
            x={x + 0.5}
            y={y + 0.5}
            width={w - 13}
            height={27}
            rx={6}
            className={`fill-well transition-[stroke] duration-240 [vector-effect:non-scaling-stroke] ${stage === 1 || stage >= 6 ? 'stroke-accent' : 'stroke-edge'}`}
          />
          <Swap as="g" k={label}>
            <text x={x + 8} y={y + 18} className={`text-[11px] ${tone}`}>
              {label}
            </text>
          </Swap>
        </g>
      )
    }
    case 'api':
      return (
        // A two-line log: each new entry pushes the last one up.
        <Swap as="g" k={stage} className={mono}>
          {stage > 0 && (
            <text x={x} y={y + 12} className="fill-subtle">
              {API_LOG[stage - 1]}
            </text>
          )}
          <text x={x} y={y + 28} className="fill-fg">
            {API_LOG[stage]}
          </text>
        </Swap>
      )
    case 'gw':
      return (
        <>
          <Lanes x={x} y={y + 2} inner={w - 4} wide={lane} />
          <Swap as="g" k={String(lane)}>
            <text x={x} y={y + 26} className={`${mono} ${lane ? 'fill-accent' : 'fill-subtle'}`}>
              {lane ? 'trade → lane 1' : 'prices · sync'}
            </text>
          </Swap>
        </>
      )
    case 'hl':
      return (
        <g className={mono}>
          <text x={x} y={y + 12} className="fill-muted tabular-nums">
            ETH <tspan data-live="px">{ethPrice(0)}</tspan>
          </text>
          <Swap as="g" k={stage < 3 ? 0 : Math.min(stage, 4)}>
            <text
              x={x}
              y={y + 28}
              className={stage === 3 ? 'fill-accent' : stage > 3 ? 'fill-fg' : 'fill-subtle'}
            >
              {stage < 3 ? 'book live' : stage === 3 ? 'order in book' : 'filled @ 3,412'}
            </text>
          </Swap>
        </g>
      )
    case 'fill': {
      // A new fill slides in on top; on match, everything that isn't a Sway wallet fades.
      const rows = stage >= 4 ? [SWAY_FILL, ...FILLS.slice(0, 2)] : FILLS
      return (
        <g className={mono}>
          {rows.map((r, i) => {
            const mine = r === SWAY_FILL
            return (
              <g
                key={r}
                className={mine && stage === 4 ? textIn : ''}
                style={{
                  ...slide,
                  transform: `translateY(${i * 15}px)`,
                  opacity: stage >= 5 && !mine ? 0.35 : 1,
                }}
              >
                <text x={x} y={y + 12} className={mine ? 'fill-accent' : 'fill-muted'}>
                  {mine && stage >= 5 ? `✓ ${r}` : r}
                </text>
              </g>
            )
          })}
        </g>
      )
    }
    case 'rew':
      return (
        <>
          <text x={x} y={y + 12} className={`${mono} fill-subtle`}>
            claimable
          </text>
          <text
            data-live="claim"
            x={x}
            y={y + 34}
            className="fill-fg text-[17px] font-medium tabular-nums"
          >
            ${CLAIM[0].toFixed(2)}
          </text>
        </>
      )
    case 'price':
      return (
        <polyline
          data-live="spark"
          data-x={x}
          data-y={y}
          data-w={w}
          points={sparkPoints(0, x, y, w)}
          className="fill-none stroke-muted [vector-effect:non-scaling-stroke]"
        />
      )
  }
}

/** The gateway's three request lanes; trading's lane widens while an order passes. */
function Lanes({ x, y, inner, wide }: { x: number; y: number; inner: number; wide: boolean }) {
  const shares = [0.55, 0.3, 0.15]
  let lx = x
  return shares.map((f, i) => {
    const w = inner * f
    const rect = (
      <rect
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
        key={i}
        x={lx}
        y={y}
        width={i === 0 && wide ? w + 6 : w}
        height={4}
        rx={2}
        className="transition-[width] duration-240 ease-(--ease-out)"
        style={{ fill: `var(--color-lane-${i + 1})` }}
      />
    )
    lx += w + 2
    return rect
  })
}
