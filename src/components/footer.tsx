import { Popover } from '@base-ui/react/popover'
import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import NumberFlow, { NumberFlowGroup } from '@/components/number-flow'
import { type Credit, lookedAt, madeWith, reading } from '@/data/credits'
import { site } from '@/data/site'
import { external } from '@/lib/external'
import { forceMotion, useMediaQuery, useMotionForced } from '@/lib/use-media-query'
import { Arrow, delay } from './layout'
import { AnimatedSignature } from './signature'

const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: site.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function saigonTime() {
  const parts = clockFormat.formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { h: get('hour'), m: get('minute') }
}

/** Saigon time, ticking. Blank until mounted, because the prerendered HTML can't know the time. */
function Clock() {
  const [time, setTime] = useState<{ h: number; m: number } | null>(null)

  useEffect(() => {
    setTime(saigonTime())
    const id = setInterval(() => setTime(saigonTime()), 10_000)
    return () => clearInterval(id)
  }, [])

  // inline-block + nowrap: hours and minutes are separate NumberFlows, and a narrow footer
  // would otherwise break the line between them ("19:" / "33").
  if (!time) return <span className="inline-block whitespace-nowrap tabular-nums">--:--</span>
  const two = { minimumIntegerDigits: 2 }
  return (
    <NumberFlowGroup>
      <span className="inline-block whitespace-nowrap tabular-nums">
        <NumberFlow value={time.h} format={two} />:
        <NumberFlow value={time.m} format={two} digits={{ 1: { max: 5 } }} />
      </span>
    </NumberFlowGroup>
  )
}

const updated = new Date(site.updated).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function CreditList({ title, items }: { title: string; items: Credit[] }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="font-mono text-meta text-subtle">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((c) => (
          <li key={c.label} className="flex items-baseline justify-between gap-4 text-meta">
            {c.href ? (
              <a href={c.href} className="group text-fg hover:underline" {...external(c.href)}>
                {/* A no-break space keeps the arrow with the last word when the title wraps. */}
                {c.label} <Arrow dir="↗" />
              </a>
            ) : (
              <span className="text-fg">{c.label}</span>
            )}
            <span className="shrink-0 text-right text-subtle">{c.note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** "built <commit>", which opens what the site was built with and the sites and reading behind it. */
function BuildCredits() {
  const dev = __BUILD_COMMIT__ === 'dev'
  return (
    <Popover.Root>
      <Popover.Trigger className="cursor-pointer underline decoration-subtle/50 decoration-dotted underline-offset-[3px] transition-colors duration-150 hover:text-fg data-popup-open:text-fg">
        built {__BUILD_COMMIT__}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" align="start" sideOffset={10} collisionPadding={16}>
          <Popover.Popup className="flex max-h-[min(70vh,520px)] w-[360px] max-w-(--available-width) origin-(--transform-origin) flex-col gap-4 overflow-y-auto rounded-[14px] border border-edge bg-card p-4 shadow-[0_18px_48px_var(--color-card-shadow)] outline-none transition-[opacity,scale] duration-150 ease-(--ease-out) [scrollbar-width:thin] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
            <div className="flex flex-col gap-1">
              <Popover.Title className="text-ui font-medium text-fg">
                How this site was made
              </Popover.Title>
              <Popover.Description className="text-meta text-muted">
                TanStack Start, React 19, Tailwind v4 and custom WebGL, built together with Claude
                Code.{' '}
                {!dev && (
                  <a
                    href={`${site.repo}/commit/${__BUILD_COMMIT__}`}
                    className="group text-accent hover:underline"
                    {...external(site.repo)}
                  >
                    Commit {__BUILD_COMMIT__} <Arrow dir="↗" />
                  </a>
                )}
              </Popover.Description>
            </div>
            <CreditList title="Looked at" items={lookedAt} />
            <CreditList title="Read" items={reading} />
            <CreditList title="Made with" items={madeWith} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * Shown only when the system asks for reduced motion: turns the site's animation back on until a
 * reload, for visitors who'd like to see the demos and shaders anyway.
 */
function MotionSwitch() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const forced = useMotionForced()
  if (!reduce) return null
  return (
    <p>
      <button
        type="button"
        aria-pressed={forced}
        onClick={() => forceMotion(!forced)}
        // Accent, with an icon: the one footer line that changes how the site behaves.
        className="inline-flex cursor-pointer items-center gap-1.5 text-accent decoration-accent/50 underline-offset-[3px] hover:underline"
      >
        {forced ? <Pause size={11} aria-hidden /> : <Play size={11} aria-hidden />}
        {forced ? 'Reduce motion on this page' : 'Enable animation on this page'}
      </button>
    </p>
  )
}

export function Footer({ i }: { i: number }) {
  return (
    <footer
      className="enter flex items-end justify-between gap-6 border-line border-t pt-6 pr-1.5"
      style={delay(i)}
    >
      <div className="flex flex-col gap-1 font-mono text-meta text-subtle">
        <p>Now: {site.now}</p>
        <p>
          Last seen in {site.city},{' '}
          {/* The full stop rides with the time: Safari would otherwise wrap it onto its own line. */}
          <span className="whitespace-nowrap">
            <Clock />.
          </span>{' '}
          Updated {updated}.
        </p>
        <p>
          <BuildCredits />
        </p>
        <MotionSwitch />
      </div>
      <AnimatedSignature />
    </footer>
  )
}
