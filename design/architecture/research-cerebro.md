# Cerebro · architecture illustration research

Source read: `~/workspaces/cerebro-web` (read-only, nothing run that writes). Paths below are relative to that repo.
Canvas: `design/portfolio.pen`, frames prefixed `Arch Cerebro ·` in the band y 31500 to 33450.
Prototype: `design/architecture/cerebro/index.html`.

Public labels only on the canvas and in the prototype. The internal → public mapping is in section 1.4 and stays off any published surface.

## 1. Architecture facts

### 1.1 Apps

| App | What it is | Evidence |
| --- | --- | --- |
| `apps/web` | Next.js App Router front end, TanStack Query, Zustand | `AGENTS.md` §1, `apps/web/app/(overview)` |
| `apps/backend` | NestJS API: MongoDB (Mongoose), Redis (BullMQ, cache, pub/sub), Socket.io | `AGENTS.md` §1, `apps/backend/src/app.module.ts` |
| `apps/ingestion` | Separate NestJS service: webhook outbox to queues, and a live price stream | `apps/ingestion/README.md`, `apps/ingestion/src/binance-live/binance-live.service.ts` |
| `apps/agents` | LangGraph AI assistant ("Alice") | `apps/agents/src/react/index.ts` |

### 1.2 Flow 1: connect a source, sync it, serve the portfolio (the story to tell)

1. **Connect.** The user adds an exchange account (read-only API key) or a wallet address in the web app. Accounts live in `apps/backend/src/wallet-accounts/`. Address families are checked in `apps/backend/src/lib/address-validator.ts` (EVM, Solana, Bitcoin, Sui, TON).
2. **Queue.** Syncs are BullMQ jobs, one queue per chain family: `wallet-processing-eth|sol|btc|sui|ton` in `apps/backend/src/wallet-processing/constants/wallet-processing.constants.ts`, run by `wallet-processing/services/orchestrators/wallet-processing-orchestrator.service.ts` and `processors/wallet-processor.service.ts`. Bulk syncs: `wallet/services/bulk-sync.service.ts` (with a rate limiter).
3. **Fetch.**
   - Exchanges: one module per exchange under `apps/backend/src/integrations/cex/{binance,kraken,okx,bitget,coinbase,bybit}` and `integrations/dex/{aster,lighter}`; each has a portfolio service, a rate limiter and an error handler (e.g. `cex/binance/services/binance-portfolio.service.ts`, `binance-rate-limiter.service.ts`).
   - On-chain: `docs/features/wallet/sync.md` shows the per-chain fan-out. EVM uses an indexer for tokens + protocols plus Hyperliquid and other protocol readers; Solana uses its own token and protocol readers; Bitcoin has its own service. Hyperliquid is read from the wallet address (`apps/backend/src/hyperliquid/`), so it counts as on-chain.
4. **Normalise.** Exchange symbols are mapped onto one token table: `integrations/exchanges/services/sync/base-exchange-sync.service.ts` (`NormalizedExchangeCoin`, `bulkUpsertCoins`), one sync class per exchange chosen by `exchange-sync-factory.service.ts`; manual fixes go through `integrations/exchanges/services/exchange-mapping.service.ts` and the admin tool.
5. **Price.** `wallet/services/asset-enrichment/*` decorates assets with price, 24h/7d/30d change and volume, routed by chain, and drops dead tokens (`sync.md`, "Decorate").
6. **Calculate and store.** `wallet/services/portfolio-calculation.service.ts` and `enhanced-portfolio.service.ts` build net worth, PnL and history; snapshots in MongoDB (`apps/backend/src/schema/`, `portfolio-snapshot/`); hot reads in Redis via `wallet/cache/portfolio-cache.service.ts`.
7. **Serve.** The API returns the portfolio; sync progress streams to the web app over Redis pub/sub + SSE (`wallet/services/redis-sse.service.ts`, channels `sync:events:*`).

### 1.3 Flow 2: live prices

`apps/ingestion/src/binance-live/binance-live.service.ts` holds one exchange websocket, batches ticks and publishes them to a Redis channel. `apps/backend/src/prices/services/prices-live-subscriber.service.ts` subscribes on every API instance, maps symbols to tokens, and `prices/prices.gateway.ts` pushes them to browsers over Socket.io. The web app re-prices the visible portfolio. Built by a teammate.

Other flows looked at and left out of the main picture:
- **AI assistant** (`apps/agents`): LangGraph state machine that calls the API and an ML service. 3 of 255 commits are Hieu's, so it appears as a context node only.
- **Swap** (`apps/backend/src/swap`, `docs/features/swap/swap-architecture.md`): routed through a swap aggregator; led by a teammate (Hieu: 6/47 backend, 14/83 web commits).
- **Admin tools** (`apps/web/app/admin`, `apps/backend/src/admin`): sync telemetry, exchange symbol mapping, webhooks. Shared; Hieu is a co-author (18 of ~90 web admin commits, e.g. the Aster symbol admin tool `f11a68c30`).

### 1.4 Internal → public label mapping (keep off canvas)

| Public label | Internal |
| --- | --- |
| Web app | `apps/web` (Next.js) |
| API | `apps/backend` controllers and services (NestJS) |
| Data collector | `wallet-processing` BullMQ queues + `wallet/services/*` + `integrations/cex|dex/*` + chain readers + asset enrichment |
| Exchanges | `integrations/cex/*`, `integrations/dex/{aster,lighter}` via `ExchangeSyncServiceFactory` |
| Wallets / chains | EVM, Solana, Bitcoin, Sui, TON, Hyperliquid readers (third-party indexers, not named) |
| Price feed | `apps/ingestion/src/binance-live` → Redis `prices:live` → `prices.gateway.ts` |
| Cache | Redis: `portfolio-cache.service.ts`, pub/sub, BullMQ |
| Database | MongoDB main DB (+ a separate market-data collector DB read by `collector/collector.service.ts`) |
| AI assistant | `apps/agents` ("Alice") |

Not shown anywhere: the indexer and market-data vendors, hosting, monitoring, the swap aggregator, env names, keys.

### 1.5 What Hieu built (evidence)

Author identities: `Hieu Le <lthieu9601@…>`, `HieuLe`, `Lê Trung Hiếu <…lthieu96…>`. 514 of 2,006 non-merge commits, Dec 2024 to Aug 2026. (`hieult-kvy` / `Cristina` is a different person.)

| Part | Share (commits touching path) | Notes |
| --- | --- | --- |
| Exchange connectors | Binance, Kraken, OKX, Bitget, Coinbase, Bybit, Aster: first author and nearly every commit | Two-part PRs per exchange: `630697afd`, `1c4d85125`, `98eb2f938` (Binance), `50d166e67`/`cc372e354` (Kraken), `4f1dbe949`/`5402e026e` (Bitget), `38bbf05fe`/`c0dea6545` (OKX), `7a521a413`/`fa969df0a` (Coinbase), `67a8d91ef`/`26257d841` (Bybit), `4ffc5ebae`/`f11a68c30`/`3c6c575b8` (Aster). **Lighter is a teammate's** (0/7). |
| Exchange sync + mapping | 9/13, first author | `integrations/exchanges/` |
| Hyperliquid | 23/48, first author | `apps/backend/src/hyperliquid`, from `42cf57697` (Mar 2025) |
| Wallet core | 138/265, first author | `wallet.service.ts` top author, `asset.service.ts`, `exchange-portfolio.service.ts` (7/9), `portfolio-cache.service.ts` (10/11) |
| EVM / Solana readers | 66/148 and 29/39, top author | `debank/`, `solscan/` |
| Price/metadata | 29/68 | `coingecko/`, moved token data onto the market-data collector DB (`f03badb0e`, `8372ad93c`) |
| Cron jobs | 32/56, top author | `cron/` |
| Web app pages | 146/496, second author | `apps/web/app/(overview)`, `lib/fetchers` (54, second) |
| Not his | queue orchestrator, live price stream, ingestion service, Bitcoin/Sui/TON readers, AI assistant, swap | Lực Nguyễn, Thanh Doan, Wai, Hung Dang Cong, Duoc Ngo |

So the honest label: "built by me" on Exchanges, Wallets / chains (EVM, Solana, Hyperliquid), Data collector (his: fetch, normalise, price, calculate; team: the per-chain queues), Cache (portfolio cache), API and Web app (with the team). Team: Database (shared schema), Price feed, AI assistant.

Open: the page says "8 exchanges". In code the 8 are Binance, Kraken, OKX, Bitget, Coinbase, Bybit, Aster, Lighter, with Hyperliquid on the wallet side. The brief listed Hyperliquid as an exchange. "6 on-chain platforms" fits EVM, Solana, Bitcoin, Sui, TON, Hyperliquid.

## 2. Micro-interactions for an explorable diagram

### 2.1 Conventions (timing and easing)

- **Durations.** NN/g ("Executing UX Animations: Duration and Motion Characteristics") puts most UI motion at 100 to 500 ms, about 100 ms for feedback, 200 to 300 ms for most. Emil Kowalski (emilkowal.ski, animations.dev) says UI motion should usually stay under 300 ms. Diagram packets are ambient, not UI, so they can run 600 to 1200 ms per edge; anything the user triggers answers within 150 ms.
- **Easing.** Ease-out for things that react to the user (hover, open, highlight): fast start, feels responsive. Ease-in-out for things moving on screen along a path (packets). Linear only for time itself (playhead, progress). Use custom curves, not the CSS defaults: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out) and `cubic-bezier(0.77, 0, 0.175, 1)` (ease-in-out) from Emil's notes.
- **Interruptible.** Hover states use CSS transitions (they retarget mid-flight) rather than keyframes. Chapter jumps cancel the running timeline instead of queueing.
- **Frequency.** Things you see constantly (hover dimming) should be quick and quiet, 120 to 150 ms. Things you see once (the first fan-in) can take longer.
- **No pop from zero.** Packets fade and scale from 0.6, not from 0; nodes lift 1 to 2 px, never bounce.

### 2.2 The interactions

1. **Hover dims the rest.** On `pointerenter` of a node: other nodes and edges fade to about 35% opacity in 150 ms ease-out, connected edges switch to accent, and a detail card (what it does, who built it, a share bar) appears. Delay the dim by about 60 ms so a cursor passing across does not flicker the whole diagram; leaving restores in 200 ms.
2. **Focus and keyboard.** Each node is a `<button>` in data-flow order, so Tab walks the pipeline the way data moves. Focus does the same as hover, plus a 2 px `:focus-visible` ring. Arrow keys move along edges (right = downstream). Enter or Space pins the detail; Escape unpins. `aria-describedby` points at the detail text, and an `aria-live="polite"` region announces chapter changes.
3. **Tap on touch.** There is no hover, so the first tap pins the node (same as focus), a tap on another node moves the pin, a tap on empty space clears it. Hit targets are at least 44 px even when the drawn node is smaller. Use `pointer: coarse` to show the detail as a bottom sheet under the diagram, not a floating tooltip.
4. **Scrubbing a timeline.** A track under the diagram maps 0..1 to the whole story. Dragging it pauses playback and sets `t` directly; every packet and highlight is a pure function of `t`, so scrubbing backwards is free. That is the main reason to drive the animation from one clock rather than independent CSS animations. samwho.com's load-balancer and bloom-filter posts and ciechanow.ski's figures all work this way: the figure is a function of a parameter you can drag.
5. **Step-through chapters.** Five labelled stops (Connect, Collect, Store, Serve, Live) on the same track. Clicking one tweens `t` to the chapter start in 400 ms ease-in-out, then plays that chapter and holds. Previous / next buttons and the left/right keys work too. Each chapter has a one-line caption that changes with a 150 ms cross-fade. Josh Comeau's posts and samwho both use a "do one thing, explain it, continue" rhythm.
6. **Packets slow near the cursor.** Each packet's speed is scaled by `lerp(0.35, 1, smoothstep(24, 72, distance))`, so packets near the pointer crawl and can be read (and hovered for their payload label, e.g. "balances · 8 exchanges"). The clock does not slow; only the packet's local progress does, so it catches up after the cursor leaves.
7. **Count-up readout.** Net worth in the web-app node counts up when the Serve chapter lands: 600 to 800 ms, ease-out-expo, tabular figures (`font-variant-numeric: tabular-nums`) so digits do not jitter. `@number-flow/react` is already installed in the portfolio and does exactly this, digit by digit, and respects reduced motion.
8. **Reduced motion.** With `prefers-reduced-motion: reduce`: no packets moving, no count-up, no auto-play. Show the 02 Collect frame as a still: edges drawn, one packet frozen on each active edge, and numbered callouts (1 to 5) on the nodes matching the chapter list. Chapters still work but change instantly (or a 120 ms opacity cross-fade). Hover and focus still dim and explain.
9. **Pause off-screen.** IntersectionObserver stops the clock when the figure is out of view and on `visibilitychange`; it resumes from the same `t`.

### 2.3 How real explainers do it

- **samwho.com** (load balancing, queueing, hashing): canvas figures with play/pause and sliders; each figure makes one point; text between figures does the explaining. Takeaway: one diagram per idea, controls right under it.
- **joshwcomeau.com**: interactive widgets inside the prose, spring physics, a reduced-motion hook used everywhere, and careful focus styles. Takeaway: motion is opt-out, and small interactive details ("try hovering this") invite play.
- **ciechanow.ski**: every figure is directly manipulable (drag the object or a slider); no autoplay; the drawing is a function of the parameters. Takeaway: scrubbing beats watching.
- **Stripe** (homepage and Connect diagrams): thin 1 px lines with a soft light pulse travelling along them, nodes as quiet cards, motion only on the lines. Takeaway: animate the edges, keep the nodes still.
- **Vercel** (framework → edge network illustrations): SVG paths with a moving gradient "beam" done with an animated `stroke-dasharray` or a gradient mask; grid backgrounds. Takeaway: a beam along a path is cheap and reads as data.
- **Inngest and Temporal** flow views: a workflow drawn as steps, the active step highlighted, and a run timeline (waterfall of spans) beside it, where hovering a span lights the step. That is variant C.

## 3. Libraries (short)

Already in the portfolio `package.json`: React 19, `@number-flow/react` (count-up), `@paper-design/shaders-react` (the site's dither and dot shaders). No animation library yet.

| Library | Fit here | Verdict |
| --- | --- | --- |
| **No library** (SVG + one `requestAnimationFrame` clock + CSS transitions for hover) | Packets as `getPointAtLength` on SVG paths, everything a function of `t`; about 200 lines | **Recommended.** Scrubbing and reduced motion are trivial, nothing added to the bundle. |
| **Motion** (motion.dev) | `animate()` and `useAnimationFrame`, springs for the hover lift, `useReducedMotion` | Good if the case-study page gains more motion; about 18 kB for `animate`. Fine, not needed. |
| **GSAP** | Timelines with labels map well onto chapters; MotionPathPlugin moves packets along paths; free since 2025 | Strong for a long scripted piece; heavier, and a second mental model next to React. |
| **React Flow** | Graph editor: pan, zoom, drag nodes, auto layout | Overkill for a fixed 9-node figure, and its look fights the site style. |
| **Rive** | Designer-authored state machines, small runtime | Good for illustration-like motion; text and themes live outside the codebase, harder to keep accessible. |

## 4. Variants on the canvas

| Frame | Id | Idea |
| --- | --- | --- |
| Arch Cerebro · A · Pipeline | `fI4rK` | Left to right: sources, data collector, cache and database, API, web app. Closest to the code. |
| Arch Cerebro · A · Pipeline · dark | `Xo3j7` | Dark sample of A. |
| Arch Cerebro · B · Hub and spoke | `E7445` | 14 sources around one view; the collector is the ring. |
| Arch Cerebro · C · Layered stack | `VnZP2` | One refresh request down the layers and back, with a trace beside it. |
| Arch Cerebro · D · Dither field | `o0n5F` | The site's 2 px dot language: ribbons of squares thicken into the collector. |

Each frame holds the 880-wide media slot showing the 02 moment with data in flight, plus a storyboard (steps, timing, easing) and its interactions.

Recommendation: build **A**, borrow C's idea of a caption per chapter, and keep D's dither for a later pass on the background.
