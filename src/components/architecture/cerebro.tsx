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

// Port of design/architecture/cerebro/index.html (variant A, pipeline). Sample numbers, public
// integrations only; data vendors are left out.

const T = 10 // seconds per loop; chapters and packets are timed in seconds
const LOOP_MS = T * 1000
const CHAPTERS = [
  {
    k: 'Connect',
    s: 0,
    e: 1.5,
    cap: 'You add a read-only exchange key or a wallet address. The API saves it and puts a sync job on the queue in Redis.',
  },
  {
    k: 'Collect',
    s: 1.5,
    e: 4.5,
    cap: 'The collector picks up the job, pulls every source, maps symbols onto one token list, prices them and streams progress back.',
  },
  {
    k: 'Store',
    s: 4.5,
    e: 6,
    cap: 'The result is written twice: a daily snapshot to the database for history, and a hot copy to the cache.',
  },
  {
    k: 'Serve',
    s: 6,
    e: 7.5,
    cap: 'The API reads the cache first, falls back to the database, and sends one portfolio to the web app.',
  },
  {
    k: 'Live',
    s: 7.5,
    e: 10,
    cap: 'A price stream publishes ticks through Redis and the API pushes them over a websocket, so numbers move without a refresh.',
  },
]

type Node = {
  t: string
  s: string
  who: 'me' | 'team'
  what: string
  mine?: string
  team?: string
  /** Step number on the reduced-motion still. */
  n?: number
  list?: string
  ctx?: boolean
}

const NODES = {
  ex: {
    t: 'Exchanges',
    s: '8 connected',
    n: 2,
    who: 'me',
    list: 'Binance · Kraken · OKX · Bitget · Coinbase · Bybit · Aster · Lighter',
    what: 'Reads balances and positions through each exchange’s read-only API, each with its own rate limiter.',
    mine: 'Binance, Kraken, OKX, Bitget, Coinbase, Bybit, Aster',
    team: 'Lighter',
  },
  wa: {
    t: 'Wallets / chains',
    s: '6 platforms',
    n: 2,
    who: 'me',
    list: 'EVM · Solana · Bitcoin · Sui · TON · Hyperliquid',
    what: 'Reads tokens, DeFi positions and NFTs for a wallet address, per chain family.',
    mine: 'EVM, Solana, Hyperliquid',
    team: 'Bitcoin, Sui, TON',
  },
  pf: {
    t: 'Price feed',
    s: 'live ticks',
    n: 5,
    who: 'team',
    what: 'A separate service on one live exchange stream, publishing batched ticks through Redis.',
  },
  co: {
    t: 'Data collector',
    s: 'a job per account',
    n: 2,
    who: 'me',
    what: 'One sync job per account: fetch, map symbols onto one token list, price, then work out net worth and PnL.',
    mine: 'fetch, normalise, price, calculate',
    team: 'per-chain queues',
  },
  db: {
    t: 'Database',
    s: 'MongoDB',
    n: 3,
    who: 'team',
    what: 'MongoDB. Accounts, the shared token list, and each day’s portfolio snapshot for history and charts.',
  },
  ca: {
    t: 'Cache',
    s: 'Redis',
    n: 3,
    who: 'me',
    what: 'Redis. The sync job queues, hot portfolio reads, sync progress events, and live price fan-out.',
    mine: 'the portfolio cache',
    team: 'queues, price fan-out',
  },
  api: {
    t: 'API',
    s: 'NestJS',
    n: 4,
    who: 'me',
    what: 'NestJS. Accounts, auth, portfolio and history endpoints. Pushes sync progress and prices to the browser.',
    mine: 'wallet, portfolio, exchange endpoints',
    team: 'auth, swap',
  },
  ai: {
    t: 'AI assistant',
    s: 'context',
    who: 'team',
    ctx: true,
    what: 'Research and portfolio ideas built on the same API. Shown for context.',
  },
  web: {
    t: 'Web app',
    s: 'Next.js',
    n: 1,
    who: 'me',
    what: 'Next.js portfolio pages that stay readable while numbers move, and say when data is loading or stale.',
    mine: 'portfolio pages',
    team: 'swap, AI chat',
  },
} satisfies Record<string, Node>
type NodeId = keyof typeof NODES
const NODE_IDS = Object.keys(NODES) as NodeId[]

const EDGES: [NodeId, NodeId, 'context'?][] = [
  ['ex', 'co'],
  ['wa', 'co'],
  ['co', 'db'],
  ['co', 'ca'],
  ['db', 'api'],
  ['ca', 'api'],
  ['api', 'web'],
  ['pf', 'ca'],
  ['api', 'ai', 'context'],
]
const eid = (a: NodeId, b: NodeId) => `${a}-${b}`

// Packets: edge, start (s), duration (s), runs backwards.
// Connect: web → API → job queue in Redis → collector picks it up.
const PACKETS: [string, number, number, boolean?][] = [
  ['api-web', 0.1, 0.45, true],
  ['ca-api', 0.6, 0.4, true],
  ['co-ca', 1.0, 0.45, true],
]
for (const d of [0, 0.35, 0.7, 1.05])
  PACKETS.push(['ex-co', 1.6 + d, 0.9], ['wa-co', 1.75 + d, 0.9])
// Collect: progress events go back through Redis pub/sub and the API to the page.
for (const s of [2.6, 3.8])
  PACKETS.push(['co-ca', s, 0.4], ['ca-api', s + 0.4, 0.3], ['api-web', s + 0.7, 0.3])
PACKETS.push(['co-db', 4.6, 0.6], ['co-ca', 4.7, 0.6], ['co-db', 5.1, 0.6], ['co-ca', 5.2, 0.6])
PACKETS.push(['db-api', 6.0, 0.6], ['ca-api', 6.05, 0.5], ['api-web', 6.75, 0.55])
for (let s = 7.6; s < 9.6; s += 1.2)
  PACKETS.push(['pf-ca', s, 0.5], ['ca-api', s + 0.5, 0.35], ['api-web', s + 0.85, 0.35])

/** The chapters a node takes part in: those with a packet running through it. */
const NODE_CHAPTERS = Object.fromEntries(
  (Object.keys(NODES) as NodeId[]).map((id) => [
    id,
    CHAPTERS.flatMap((c, i) =>
      PACKETS.some(([e, s]) => e.split('-').includes(id) && s >= c.s && s < c.e) ? [i] : [],
    ),
  ]),
) as Record<NodeId, number[]>

const GRID = {
  wide: {
    gridTemplateColumns:
      'minmax(0,1.25fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,0.85fr) minmax(0,1.1fr)',
    gridTemplateAreas: '"ex co db . web" "wa co . api web" "pf . ca ai web"',
    gap: '14px 36px',
  },
  narrow: {
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    gridTemplateAreas: '"ex wa" "co pf" "db ca" "api ai" "web web"',
    gap: '28px 14px',
  },
} satisfies Record<string, CSSProperties>

const BASE = 24180 // sample net worth
const DRIFT = [0, 0, 18.4, -6.2, 31.9]
const REDUCED_T = 3.2

type View = {
  chap: number
  step: number
  worth: number | null
  sync: string
  live: string
  /** Collect progress in 24ths, so both source lists (8 and 6) advance in whole steps. */
  pull: number
  /** Price-feed step, 0.7s each. */
  px: number
}

// What the nodes show. Sample data only.
const SNAPSHOTS = ['10/23 $23,890', '10/22 $23,512'] // newest first
const NEW_SNAPSHOT = '10/24 $24,180'
const CACHE = ['job queued', 'progress → api', 'set · ttl 60s', 'hit · 1.2 ms', 'ticks → api']
// Short enough to stay on one line in the narrowest column (~13 mono characters).
const API_LOG = ['new account', 'sync', 'snapshot ok', 'served 38ms', 'ws: ticks']
const STEPS = ['fetch', 'normalise', 'price', 'calculate']

/** A pure function of the clock: everything React renders. Packets move outside React. */
function viewAt(t: number): View {
  const tick = t >= 7.5 ? Math.floor((t - 7.6 - 0.85 - 0.35) / 1.2) : -1
  const live = PACKETS.filter(([, s, d]) => t > s && t < s + d).map(([e]) => e)
  return {
    chap: CHAPTERS.findIndex((c) => t >= c.s && t < c.e),
    step: t < 1.5 || t >= 4.5 ? -1 : Math.floor(((t - 1.5) / 3) * STEPS.length),
    worth: t < 7.2 ? null : BASE + (DRIFT[Math.max(0, Math.min(4, tick + 1))] ?? 0),
    sync: t < 1.5 ? 'waiting' : t < 7.2 ? 'syncing' : t < 7.6 ? 'synced just now' : 'live',
    live: [...new Set(live)].sort().join(' '),
    pull: Math.floor(clamp((t - 1.5) / 3) * 24),
    px: Math.floor(t / 0.7),
  }
}

const sameView = (a: View, b: View) =>
  (Object.keys(a) as (keyof View)[]).every((k) => a[k] === b[k])

/** Cerebro: how a portfolio sync moves through the system. Hover, focus or tap a part. */
export function CerebroArchitecture() {
  const frameRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLButtonElement>>>({})
  const barRefs = useRef<HTMLElement[]>([])
  // Reduced motion: a numbered still, mid-collect.
  const { reduce, clock, renderRef, playing, setPlaying, speed, setSpeed } = useFigureClock(
    frameRef,
    {
      still: REDUCED_T * 1000,
    },
  )
  const [narrow, setNarrow] = useState(false)
  const [d, setD] = useState<Record<string, string>>({})
  const [view, setView] = useState(() => viewAt(0))
  const { sel, bind } = useSelection<NodeId>(gridRef)

  // Measure the cards, draw a curve between their edges.
  useEffect(() => {
    const grid = gridRef.current
    const frame = frameRef.current
    if (!grid || !frame) return
    const layout = () => {
      setNarrow(frame.clientWidth < NARROW)
      const R = grid.getBoundingClientRect()
      const box = (id: NodeId) => {
        const r = nodeRefs.current[id]?.getBoundingClientRect()
        if (!r) return null
        const l = r.left - R.left
        const t = r.top - R.top
        return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 }
      }
      const into: Record<string, number> = {}
      const next: Record<string, string> = {}
      for (const [a, b] of EDGES) {
        const A = box(a)
        const B = box(b)
        if (!A || !B) continue
        if (B.l - A.r >= 24 || (B.l >= A.r - 4 && B.t < A.b && B.b > A.t)) {
          // Side by side. Two edges into the collector land 8px apart.
          into[b] = (into[b] ?? 0) + 1
          const y2 = B.cy + (b === 'co' ? (into[b] === 1 ? -8 : 8) : 0)
          next[eid(a, b)] = curve(A.r, A.cy, B.l, y2, true)
        } else if (B.t >= A.b - 4) {
          next[eid(a, b)] = curve(A.cx, A.b, B.cx, B.t, false)
        } else {
          next[eid(a, b)] = curve(A.l, A.cy, B.r, B.cy, true)
        }
      }
      setD(next)
    }
    return watchLayout([grid, frame, ...Object.values(nodeRefs.current)], layout)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: `d` moves the paths, so lengths are re-measured
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const paths: Record<string, { el: SVGPathElement; len: number }> = {}
    for (const el of svg.querySelectorAll<SVGPathElement>('path[data-k]')) {
      paths[el.dataset.k ?? ''] = { el, len: el.getTotalLength() }
    }
    const dots = [...svg.querySelectorAll<SVGGElement>('g[data-p]')]

    const render = () => {
      const t = (clock.current % LOOP_MS) / 1000
      PACKETS.forEach(([e, s, dur, back], i) => {
        const g = dots[i]
        const p = paths[e]
        const lt = (t - s) / dur
        if (!g) return
        if (lt <= 0 || lt >= 1 || !p?.len) {
          g.style.display = 'none'
          return
        }
        g.style.display = ''
        // Fade over the first and last 15% so a packet never pops in or out.
        g.style.opacity = String(clamp(Math.min(lt, 1 - lt) / 0.15))
        const u = ease(lt)
        const pt = p.el.getPointAtLength((back ? 1 - u : u) * p.len)
        for (const c of g.children) {
          c.setAttribute('cx', String(pt.x))
          c.setAttribute('cy', String(pt.y))
        }
      })
      CHAPTERS.forEach((c, i) => {
        const bar = barRefs.current[i]
        if (bar) bar.style.width = `${clamp((t - c.s) / (c.e - c.s)) * 100}%`
      })
      const next = viewAt(t)
      setView((v) => (sameView(v, next) ? v : next))
    }
    renderRef.current = render
    render()
  }, [d, clock, renderRef])

  const jump = (i: number) => {
    const c = CHAPTERS[i]
    const at = playing ? c.s : c.s + (c.e - c.s) * 0.55
    clock.current += at * 1000 - (clock.current % LOOP_MS)
    renderRef.current?.()
  }

  const relNodes = new Set<NodeId>()
  const relEdges = new Set<string>()
  if (sel) {
    relNodes.add(sel)
    for (const [a, b] of EDGES) {
      if (a !== sel && b !== sel) continue
      relEdges.add(eid(a, b))
      relNodes.add(a)
      relNodes.add(b)
    }
  }
  const live = new Set(view.live.split(' '))
  const liveNodes = new Set(EDGES.filter(([a, b]) => live.has(eid(a, b))).flat())
  const chap = CHAPTERS[Math.max(0, view.chap)]
  const pct = Math.round((view.pull / 24) * 100)
  const n = sel && (NODES[sel] as Node)
  const part = n && {
    title: n.t,
    mine: n.who === 'me',
    chip: n.who === 'me' ? 'built by me' : 'team',
    what: n.what,
    mineText: n.mine,
    teamText: n.team,
  }

  return (
    <ArchFigure
      title="How a portfolio sync moves through Cerebro"
      mineLabel="built by me"
      narrow={narrow}
      frameRef={frameRef}
    >
      <div className="relative">
        <div
          ref={gridRef}
          className="relative grid items-center"
          style={GRID[narrow ? 'narrow' : 'wide']}
        >
          {NODE_IDS.map((id) => {
            const node: Node = NODES[id]
            const mine = node.who === 'me'
            const dim = sel && !relNodes.has(id)
            const b = bind(id)
            return (
              <button
                key={id}
                ref={(el) => {
                  if (el) nodeRefs.current[id] = el
                }}
                type="button"
                data-node={id}
                aria-label={`${node.t}, ${mine ? 'built by me' : 'team'}`}
                aria-describedby="cerebro-arch-detail"
                style={{
                  gridArea: id,
                  background: liveNodes.has(id) ? LIVE_FILL : 'var(--color-card)',
                  borderColor:
                    sel === id || liveNodes.has(id)
                      ? 'var(--color-accent)'
                      : mine
                        ? MINE
                        : 'var(--color-edge)',
                }}
                {...b}
                onKeyDown={(e) => {
                  b.onKeyDown(e)
                  const down = e.key === 'ArrowRight' || e.key === 'ArrowDown'
                  const up = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
                  if (!down && !up) return
                  e.preventDefault()
                  // Arrows walk the data path: right/down follows it, left/up goes back.
                  const to = EDGES.find(([a, b]) => (down ? a === id : b === id))
                  if (to) nodeRefs.current[down ? to[1] : to[0]]?.focus()
                }}
                className={`relative min-h-11 w-full min-w-0 cursor-pointer rounded-lg border p-[9px_12px_10px] text-left wrap-anywhere transition-[opacity,border-color,background-color] ease-(--ease-out) ${sel === id || liveNodes.has(id) ? 'duration-150' : 'duration-700'} ${dim ? 'opacity-35' : node.ctx ? 'opacity-70' : ''} ${id === 'web' && narrow ? 'max-w-60 justify-self-center' : ''}`}
              >
                {reduce && node.n && (
                  <span className="absolute -top-2 -left-2 size-[18px] rounded-full bg-fg text-center font-mono text-[11px] leading-[18px] text-bg">
                    {node.n}
                  </span>
                )}
                <span className="flex items-center justify-between gap-1.5">
                  <span className="font-medium text-fg">{node.t}</span>
                  <Dot mine={mine} />
                </span>
                <span className="block font-mono text-meta text-muted">{node.s}</span>
                {node.list && (
                  <Sources
                    names={node.list.split(' · ')}
                    pull={view.pull}
                    chap={view.chap}
                    narrow={narrow}
                  />
                )}
                {id === 'co' && <Steps on={view.step} />}
                {id === 'db' && <Snapshots stored={view.chap >= 2} />}
                {id === 'ca' && (
                  <LogLine k={CACHE[Math.max(0, view.chap)]} on={view.chap >= 2}>
                    {CACHE[Math.max(0, view.chap)]}
                  </LogLine>
                )}
                {id === 'api' && (
                  <LogLine k={API_LOG[Math.max(0, view.chap)]} on={view.chap !== 1}>
                    {view.chap === 1 ? (
                      <>
                        sync <NumberFlow value={pct} suffix="%" />
                      </>
                    ) : (
                      API_LOG[Math.max(0, view.chap)]
                    )}
                  </LogLine>
                )}
                {id === 'pf' && (
                  <span className="mt-1.5 block font-mono text-meta text-muted tabular-nums">
                    BTC <NumberFlow value={Math.round(67412 + wave(reduce ? 0 : view.px) * 3)} />
                  </span>
                )}
                {id === 'web' && <Readout worth={view.worth} sync={view.sync} pct={pct} />}
              </button>
            )
          })}
        </div>
        <svg
          ref={svgRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {EDGES.map(([a, b, ctx]) => {
            const k = eid(a, b)
            const on = live.has(k) || relEdges.has(k)
            return (
              <path
                key={k}
                data-k={k}
                d={d[k] ?? ''}
                strokeDasharray={ctx ? '2 4' : undefined}
                className={`fill-none transition-[stroke,opacity] ease-(--ease-out) ${on ? 'stroke-accent duration-150' : 'stroke-subtle/45 duration-700'} ${sel && !relEdges.has(k) ? 'opacity-25' : ''}`}
              />
            )
          })}
          {PACKETS.map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed list, matched by index in render()
            <g key={i} data-p={i} style={{ display: 'none' }}>
              <circle r={10} className="fill-accent/12" />
              <circle r={4} className="fill-accent" />
            </g>
          ))}
        </svg>
      </div>

      <Track
        playing={playing}
        onToggle={() => setPlaying(!playing)}
        speed={speed}
        onSpeed={setSpeed}
        labels={CHAPTERS.map((c) => c.k)}
        current={view.chap}
        onJump={jump}
        onSeek={(i, f) => {
          const c = CHAPTERS[i]
          clock.current += (c.s + f * (c.e - c.s)) * 1000 - (clock.current % LOOP_MS)
          renderRef.current?.()
        }}
        marked={new Set(sel ? NODE_CHAPTERS[sel] : [])}
        barRefs={barRefs}
      />
      <Detail
        domId="cerebro-arch-detail"
        minH={[100, 140]}
        selKey={sel}
        part={part || null}
        chapter={Math.max(0, view.chap)}
        text={
          <>
            <b className="font-medium text-fg">{chap.k}.</b> {chap.cap}
          </>
        }
        narrow={narrow}
      />
    </ArchFigure>
  )
}

/** Exchange or chain names; each lights up as the collector pulls from it, then turns to done. */
function Sources({
  names,
  pull,
  chap,
  narrow,
}: {
  names: string[]
  pull: number
  chap: number
  narrow: boolean
}) {
  const done = Math.floor((pull * names.length) / 24)
  const collecting = chap === 1
  return (
    <>
      {!narrow && (
        <span className="mt-0.5 block font-mono text-[11px] leading-normal">
          {names.map((n, i) => (
            <span key={n}>
              {i > 0 && <span className="text-subtle"> · </span>}
              <span
                className={`transition-colors duration-150 ${collecting && i === done ? 'text-accent' : i < done ? 'text-muted' : 'text-subtle'}`}
              >
                {n}
              </span>
            </span>
          ))}
        </span>
      )}
      <span className="mt-1 block font-mono text-[11px] text-subtle tabular-nums">
        <NumberFlow value={done} />/{names.length} synced
      </span>
    </>
  )
}

/** Daily snapshots; the new one lands on top when the collector writes. */
function Snapshots({ stored }: { stored: boolean }) {
  const rows = stored ? [NEW_SNAPSHOT, SNAPSHOTS[0]] : SNAPSHOTS
  return (
    <span className="mt-1.5 grid font-mono text-[11px] leading-normal whitespace-nowrap tabular-nums">
      {/* Labelled like the web app's NET WORTH, so the rows read as history, not some other data. */}
      <span className="mb-0.5 tracking-[0.6px] text-muted">SNAPSHOTS</span>
      {rows.map((r) => (
        <span key={r} className={r === NEW_SNAPSHOT ? `text-accent ${textIn}` : 'text-subtle'}>
          {r}
        </span>
      ))}
    </span>
  )
}

/** One status line; a new `k` crossfades the line, a number inside rolls by itself. */
function LogLine({ k, on, children }: { k: string; on: boolean; children: React.ReactNode }) {
  return (
    <Swap
      k={k}
      className={`mt-1.5 font-mono text-[11px] leading-normal whitespace-nowrap tabular-nums transition-colors duration-240 ${on ? 'text-fg' : 'text-muted'}`}
    >
      {children}
    </Swap>
  )
}

const STEP_ROW = 26 // px: a 24px row plus the 2px gap

/** The collector's steps. One highlight slides from step to step instead of each row blinking. */
function Steps({ on }: { on: number }) {
  return (
    <span className="relative mt-2 grid gap-0.5">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-6 rounded bg-accent/10 transition-[translate,opacity] duration-240 ease-(--ease-out)"
        style={{ translate: `0 ${Math.max(0, on) * STEP_ROW}px`, opacity: on < 0 ? 0 : 1 }}
      />
      {STEPS.map((s, i) => (
        <span
          key={s}
          className={`relative h-6 px-2 py-[3px] font-mono text-meta transition-colors duration-240 ${i === on ? 'text-accent' : 'text-muted'}`}
        >
          <b className={`mr-1.5 font-normal ${i === on ? 'text-accent' : 'text-subtle'}`}>
            0{i + 1}
          </b>
          {s}
        </span>
      ))}
    </span>
  )
}

/** A tiny portfolio card: hidden while syncing, then the number lands and drifts with live prices. */
function Readout({ worth, sync, pct }: { worth: number | null; sync: string; pct: number }) {
  const bars = [62, 41, 26]
  return (
    <span className="mt-2 grid gap-1.5">
      <span className="font-mono text-[11px] tracking-[0.6px] text-muted">NET WORTH</span>
      <span className="flex h-[22px] items-baseline gap-1.5 text-[15px] font-medium tabular-nums text-fg">
        {worth === null ? (
          '$ ·····'
        ) : (
          <NumberFlow
            value={worth}
            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
          />
        )}
        {worth !== null && (
          <small className="font-mono text-meta text-muted">
            {worth >= BASE ? '+1.2%' : '+1.1%'}
          </small>
        )}
      </span>
      {bars.map((w, i) => (
        <span key={w} className="h-1 overflow-hidden rounded-xs bg-well">
          <i
            className="block h-full rounded-xs transition-[width] duration-500 ease-(--ease-out)"
            style={{
              width: worth === null ? 0 : `${w}%`,
              background: `var(--color-lane-${i + 1})`,
            }}
          />
        </span>
      ))}
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
        <i
          className={`inline-block size-1.5 rounded-full transition-colors duration-240 ${worth === null ? 'bg-subtle' : 'bg-accent'}`}
        />
        <Swap k={sync}>
          <span>
            {sync}
            {sync === 'syncing' && (
              <>
                {' '}
                <NumberFlow value={pct} suffix="%" />
              </>
            )}
          </span>
        </Swap>
      </span>
    </span>
  )
}
