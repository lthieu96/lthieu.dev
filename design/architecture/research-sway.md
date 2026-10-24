# Sway architecture illustration: research

Research for the animated system map in the Sway case study. Read from the Sway monorepo
(read-only) on 2026-10-24.

This repo is public. Service directory names are written as placeholders: `[gateway]`,
`[fill-stream]`, `[read-proxy]`. The real names, hosting and vendors are in the private
hand-off, not here. Leave out of anything public: vendors, hosting, how the gateway gets more
capacity, which accounts are tracked, past bugs, fee numbers, keys, URLs.

## 1. Architecture: what the code does

Monorepo: `apps/` holds mobile (Expo), backend (NestJS), pipeline (LLM workers), `[gateway]` (Rust),
`[read-proxy]` (Node), `[fill-stream]` (NestJS), web, admin, smart-contract (Foundry). The map is in
`docs/project-overview.md`.

### The order round trip (the main animation)

1. **Phone app → API.** Taking a side calls `POST /trading/open` with the wallet and a short-lived
   agent key. The phone never sends orders to the exchange itself, it only reads.
   `apps/mobile/store/trading-store.ts`, `apps/backend/src/trading/trading.controller.ts`,
   `docs/trading/execution.md`.
2. **API writes the trade log first.** A `trade_log` row is written as PENDING before the order
   leaves, then `HlExchangeService` builds and signs the order.
   `apps/backend/src/trading/`, `apps/backend/src/hyperliquid/core/`.
3. **API → Rate-limit gateway.** Every exchange call goes through the gateway. The whole trade
   reserves its cost once (an "envelope") so it cannot pass its reads and then be refused on the
   order. `apps/backend/src/hyperliquid/core/hl-envelope.ts`, `[gateway]/src/balancer/envelope.rs`.
4. **Gateway lanes.** The exchange limits requests per minute. The gateway charges each call its
   weight (`weights.rs`) against a per-minute ledger (`ledger.rs`) split into tenants:
   - **trading** (open, close, cancel, TP/SL): never queued, fails fast with "busy, retry in N s",
     because a market order held for 3 seconds is no longer the trade the person confirmed;
   - **account** (wallet setup, withdrawals): waits up to a few seconds;
   - **background** (reconcile, sync, rankers): queued and spread over the minute;
   - **user** (phone reads in failover): capped per person, cached and shared between phones.
   Source: `[gateway]/src/balancer/{auth,ledger,weights,cache,envelope}.rs`, `docs/[gateway]/`.
   Public wording: three lanes, *Trades first · App reads · Background*. This matches the
   existing `request-budget` figure in `src/components/case-study.tsx`.
5. **Gateway → Hyperliquid.** The signed order goes to the exchange's `/exchange` endpoint.
6. **Hyperliquid → Fill stream.** `[fill-stream]` listens to the exchange's trade and event
   streams, matches each fill against the wallets of Sway users (refreshed every few minutes), and
   saves the match **before** anything else, keyed on the exchange's trade id plus wallet, so
   retries and replays converge. Both sides of a trade between two Sway users are kept.
   `[fill-stream]/src/stream/`, `[fill-stream]/src/ingress/ingress-matcher.processor.ts`,
   `packages/[fill-stream]-shared/src/schemas/`, `docs/[fill-stream]/raw-data.md`.
7. **Fill stream → API.** The backend claims saved fills every 2 s (one replica wins each row),
   splits flips into close plus open legs, completes `trade_log` with price, fees and P&L, and
   handles fills that arrive out of order (a close before its open).
   `apps/backend/src/trade-log-aggregation/trade-log-aggregation.service.ts`,
   `apps/backend/src/[fill-stream]-raw-data/`.
8. **API → Phone app.** Matches also feed fill notifications: domain event → fan-out queue →
   delivery queue → push. `apps/backend/src/[fill-stream]-matches/hl-match-to-notification.service.ts`,
   `apps/backend/src/notification/`, `apps/mobile/lib/push/push-manager.ts`, `docs/notifications/README.md`.

### The side paths

- **Price feed.** The gateway holds one live socket to the exchange and fans it out to every
  phone (`GET /ws`), and serves the latest mid prices to the API (`GET /prices`) at zero request
  cost; the API refuses to trade on a price older than about 6 s. Phones read the exchange
  directly and fall back to the gateway. `[gateway]/src/balancer/ws/`, `[gateway]/src/balancer/prices.rs`.
- **Story pipeline → cards.** The pipeline ingests news and posts, extracts assets with an LLM,
  decides whether a story is new and worth a card, narrates it and syncs it to the API as a
  narrative card. `apps/pipeline/src/narrative-sync/narrative-sync.service.ts`, `docs/pipeline/`.
  Mostly built by others: label it "team", not Hieu.
- **Rewards → on-chain.** Each fill's builder fee is split into reward rows at fill time
  (`apps/backend/src/reward/`). An hourly job batches them and calls `settle()` on the
  `SwayFeeSettlement` contract on Arbitrum. People claim from the app, and balances left
  unclaimed for 180 days go back to the treasury. `apps/smart-contract/src/SwayFeeSettlement.sol`,
  `apps/backend/src/settlement/`, `apps/backend/src/claim/`, `docs/smart-contract/README.md`,
  `docs/rewards-referrals/README.md`.
- Not drawn: web (wallet-connect hand-off), admin, `[read-proxy]` (an older read path for phones,
  kept alongside the gateway), money movement (on-ramp, deposits, withdrawals).

### Who built what (git history)

`git log` by "Lê Trung Hiếu" and "Hieu Le" (191 commits). Lines added come from `git log --numstat`.

| Public label | Hieu's share | Evidence | Label on the map |
| --- | --- | --- | --- |
| Rate-limit gateway (and Price feed) | ~85% of lines, 8 of 11 commits | forwarding, ledger and tenant admission, envelopes, market-data socket and `/prices`, live monitor | **built by me** |
| Rewards contract + settlement jobs | ~97% of contract lines, ~97% of `settlement/` | contract scaffold, `settle()`, `claim()` and clawback, deploy; backend settlement core, fee sweep, claim flow, admin APIs, balance checks | **built by me** |
| Fill stream | ~37% of lines (second after one teammate); a teammate scaffolded it | moved it out of the API into its own service, switched it to the trade and event streams, saved matches durably, batched taps | **co-built** |
| Fill → notification path | ~40% of `[fill-stream]-matches/` | fill notifications consumer; notification schema, triggers, inbox, push on device | **co-built** |
| API | 106 of 665 commits | fills to trade log, notifications, rewards, markets sync | worked on |
| Phone app | 75 of 978 commits | positions, TP/SL, orders, perps list, inbox, push, gateway fallback | worked on |
| Story pipeline | 38 of 343 commits, mostly macro event lanes and digest | not credited, per the brief | team |
| Hyperliquid | external | | none |

## 2. Animation approaches

Sizes measured on 2026-10-24 (jsDelivr file, `gzip -9`) unless the vendor's docs say otherwise.
The portfolio has **no** animation library installed (`package.json`: no `motion`, no `gsap`).

| Option | Size (gz) | Strengths | Weaknesses | Fit here |
| --- | --- | --- | --- | --- |
| **Plain SVG + a small rAF timeline** (`getPointAtLength`, `stroke-dashoffset`) | 0 kB | scales with the `viewBox`; easy pause, seek and replay; theme through CSS variables; renders on the server | you write the timeline (~150 lines) | **Best.** The diagram is static, only packets and trails move |
| CSS `offset-path: path()` packets | 0 kB | declarative, GPU-composited, works with CSS keyframes | `path()` uses CSS pixels and **does not scale with the SVG `viewBox`**, so it breaks on a responsive diagram unless the packet sits in a fixed-size, transform-scaled box; seeking means pausing the animation and setting a negative `animation-delay` | ok for a fixed-size hero, not this |
| SMIL `<animateMotion>` + `<mpath>` | 0 kB | follows the path in viewBox units; `pauseAnimations()` and `setCurrentTime()` exist | timing logic lives in attributes, sequencing is clumsy, reduced motion is manual, a dead-end API | prototype only |
| **Motion** (motion.dev) | `motion` component 43 kB, `m` + `LazyMotion` ~5 kB plus 24 kB `domAnimation`, `useAnimate` mini 3.3 kB (vendor docs) | `pathLength` drawing, animates `offsetDistance`, springs, `useReducedMotion`, React-friendly | `pathLength` and `offset-path` share the scaling problem above; another dependency for something rAF covers | good if the site adopts Motion for other micro-interactions; then use `useAnimate` mini for fades |
| **GSAP + MotionPathPlugin** | 27 kB + 9 kB | best timeline API (labels, `seek`, `timeScale`), MotionPath follows SVG paths in viewBox units; all plugins free since Webflow bought it | 36 kB and imperative, for an 8-step loop | overkill here; the right pick for a long scroll-driven story |
| **Rive** | runtime JS ~108 kB plus WASM ~321 kB (canvas-lite) | editor-built state machines, very smooth | authored outside the code, so copy, tokens and theme drift; heavy; no real text accessibility | no |
| **Lottie** | `lottie_light` 45 kB, full 74 kB; dotLottie WASM ~484 kB | designer handoff from After Effects | playback only, poor for hover and seek, theming is hard | no |
| **Theatre.js** | core ~48 kB | visual keyframe studio | aimed at 3D and cinematic work; development has slowed | no |
| **React Flow / xyflow** | ~58 kB plus CSS | real graph editor: pan, zoom, auto edges | built for editable graphs; pan and zoom fight page scroll; its default look reads as "tool" | no |
| **Canvas 2D** | 0 kB | thousands of particles, crisp with `devicePixelRatio` | hit-testing, text and accessibility by hand | only for variant C (dither dots) |

### How others do it (brief)

- **samwho.dev** (load balancing, hashing, retries): checked in `samwho/visualisations`. It uses
  **PixiJS + GSAP**, as small simulations with play controls next to the prose. The lesson is
  one idea per figure, and the reader controls the clock.
- **joshwcomeau.com**: React widgets placed in the MDX, each with its own controls (sliders, step
  buttons), and reduced-motion handled per widget. The lesson is to explain by stepping, not by
  looping.
- **Vercel, Linear, Stripe, Railway, Inngest** marketing diagrams (seen, not inspected this
  session): SVG lines with a moving gradient "beam" or dash. The packet is a short bright segment
  drawn with `stroke-dasharray` or a mask, not a dot. They loop slowly, lay out at fixed sizes,
  often switch to a stacked layout on phones, and are usually decorative, with no hover. The
  restraint worth copying: grey lines, one accent beam, no glow.

### Micro-interactions (brief; the Cerebro agent covers more)

Tooltips open after a short delay (about 120 ms) and close at once; enter with a 4 px rise over
150 ms ease-out. The stage highlight glides between items instead of jumping. Pause when off
screen. With `prefers-reduced-motion`: no travel, the current stage is drawn in full, and stages
change only when clicked.

## 3. Recommendation

Use **plain SVG plus a tiny rAF timeline**, no library. The diagram is fixed geometry, so one
data table drives two layouts (wide 880 and a stacked phone layout). Packets follow paths with
`getPointAtLength`, which scales with the `viewBox`, and trails draw with `stroke-dashoffset`.
Seek, pause, replay and reduced motion are a few lines because time is one number. It adds 0 kB,
renders on the server in TanStack Start, and themes through the existing CSS variables. If the
site later adopts Motion for UI fades, the tooltip and caption can use `useAnimate` mini (3.3 kB);
the map itself does not need it.

Favourite variant: **A · Node map**, with D's narrated captions in the control bar. The
prototype is `design/architecture/sway/index.html`.
