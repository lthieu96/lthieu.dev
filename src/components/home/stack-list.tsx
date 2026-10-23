import { useEffect, useRef, useState } from 'react'
import {
  siDocker,
  siExpo,
  siExpress,
  siGithubactions,
  siGooglecloud,
  siMongodb,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siRedis,
  siRemix,
  siRubyonrails,
  siRust,
  siSentry,
  siTypescript,
} from 'simple-icons'
import { type Logo, ParticleLogo } from '@/components/shaders/particle-logo'
import type { stack as stackData } from '@/data/about'
import { siBullmq } from './bullmq-icon'

const logos: Record<string, Logo['icon']> = {
  TypeScript: siTypescript,
  React: siReact,
  'Next.js': siNextdotjs,
  Remix: siRemix,
  'React Native (Expo)': siExpo,
  'Node.js': siNodedotjs,
  NestJS: siNestjs,
  Express: siExpress,
  Rails: siRubyonrails,
  Rust: siRust,
  MongoDB: siMongodb,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
  BullMQ: siBullmq,
  Docker: siDocker,
  GCP: siGooglecloud,
  'GitHub Actions': siGithubactions,
  Sentry: siSentry,
}

// Outline-style logos come out much thinner than solid ones once sampled into particles, so they
// get a stroke of the same fill to even out the weight. Values are in the icon's 24-unit viewBox.
const weight: Record<string, number> = {
  React: 0.4,
  'Node.js': 0.35,
  Express: 0.55,
  Rails: 0.3,
  PostgreSQL: 0.5,
  'GitHub Actions': 0.35,
  Sentry: 0.2,
}

const names = Object.keys(logos)
const tileLogos = names.map((name) => ({ icon: logos[name], weight: weight[name] }))

/**
 * The home "Stack" list with a logo tile beside it (under it on phones). Hovering (or focusing)
 * a tech previews its logo as particles and dims the rest; clicking or tapping pins it. Moving
 * between techs flies the particles into the next logo; with nothing picked the tile cycles on
 * its own. The pointer scatters the particles (on touch, only once pinned). Esc unpins.
 * The techs are one tab stop; arrow keys, Home and End move between them.
 * Decorative only: the text already says everything.
 */
export function StackList({ stack }: { stack: typeof stackData }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const shown = hovered ?? pinned
  const techs = stack.flatMap((s) => s.value.split(', '))
  // The one tech in the tab order: the last one focused.
  const [current, setCurrent] = useState(techs[0])
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  // `?tune` shows sliders for the particle density, scatter radius and click burst. Read after hydration,
  // since the prerendered page has no query string.
  const [tune, setTune] = useState(false)
  const [grid, setGrid] = useState(140)
  const [repel, setRepel] = useState(20)
  const [burst, setBurst] = useState(5)
  const [count, setCount] = useState(0)
  useEffect(() => setTune(new URLSearchParams(location.search).has('tune')), [])

  useEffect(() => {
    if (!pinned) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPinned(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pinned])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = techs.indexOf(current)
    const to = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: techs.length - 1,
    }[e.key]
    if (to === undefined) return
    e.preventDefault()
    buttons.current.get(techs[Math.max(0, Math.min(techs.length - 1, to))])?.focus()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <dl
          className="flex flex-1 flex-col gap-2 text-list"
          onPointerLeave={() => setHovered(null)}
          onKeyDown={onKeyDown}
        >
          {stack.map((s) => {
            const items = s.value.split(', ')
            return (
              <div key={s.label} className="flex gap-6">
                <dt className="w-24 shrink-0 text-muted">{s.label}</dt>
                <dd className="text-fg">
                  {items.map((t, i) => (
                    <button
                      key={t}
                      type="button"
                      ref={(el) => {
                        if (el) buttons.current.set(t, el)
                        else buttons.current.delete(t)
                      }}
                      tabIndex={t === current ? 0 : -1}
                      aria-pressed={pinned === t}
                      // Touch has no hover: a tap goes straight to pinning.
                      onPointerEnter={(e) => e.pointerType !== 'touch' && setHovered(t)}
                      onFocus={() => {
                        setHovered(t)
                        setCurrent(t)
                      }}
                      onBlur={() => setHovered(null)}
                      onClick={() => setPinned((p) => (p === t ? null : t))}
                      // The focus ring goes on the name, not the button: that would ring the comma too.
                      className="group cursor-pointer focus-visible:outline-none"
                    >
                      <span
                        className={`rounded-[4px] outline-accent outline-offset-2 group-focus-visible:outline-2 decoration-accent decoration-1 underline-offset-4 transition-opacity duration-200 ${shown && shown !== t ? 'opacity-35' : ''} ${pinned === t ? 'underline' : ''}`}
                      >
                        {t}
                      </span>
                      {/* The separator sits inside the button, so the cursor doesn't flicker to a
                          text caret between techs. `pre` keeps its space: a button is inline-block,
                          which would drop a trailing one. */}
                      {i < items.length - 1 && (
                        <span
                          aria-hidden
                          // Dims with the rest whenever a tech is up: the comma is never the highlight.
                          className={`whitespace-pre transition-opacity duration-200 ${shown ? 'opacity-35' : ''}`}
                        >
                          ,{' '}
                        </span>
                      )}
                    </button>
                  ))}
                </dd>
              </div>
            )
          })}
        </dl>
        {/* Centred on the list; the negative margin lets the 160px tile overhang the 112px
            list instead of pushing it down from the heading. */}
        <div
          aria-hidden
          className={`relative size-40 shrink-0 self-center sm:-my-6 ${pinned ? 'touch-none' : ''}`}
        >
          <ParticleLogo
            logos={tileLogos}
            shown={shown ? names.indexOf(shown) : null}
            touch={pinned !== null}
            grid={grid}
            repelRadius={repel}
            burst={burst}
            onCount={tune ? setCount : undefined}
            className="size-full"
          />
        </div>
      </div>
      {tune && (
        <div className="flex flex-col gap-2 text-meta text-muted">
          <Slider label="Density" min={48} max={160} step={8} value={grid} onChange={setGrid}>
            {grid}×{grid}
          </Slider>
          <Slider label="Repel radius" min={4} max={48} step={1} value={repel} onChange={setRepel}>
            {repel}px
          </Slider>
          <Slider label="Click burst" min={0} max={12} step={0.5} value={burst} onChange={setBurst}>
            {burst === 0 ? 'off' : burst}
          </Slider>
          <p className="font-mono">{count} particles in this logo</p>
        </div>
      )}
    </div>
  )
}

function Slider({
  label,
  children,
  onChange,
  ...range
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  children: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-4">
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        {...range}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="flex-1 accent-current"
      />
      <span className="w-20 text-right font-mono text-fg">{children}</span>
    </label>
  )
}
