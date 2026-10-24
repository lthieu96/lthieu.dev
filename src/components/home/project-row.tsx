import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { hasWorkDetail, WorkDetail } from '@/components/home/work-detail'
import { DitherImage } from '@/components/shaders/dither-image'
import type { Project } from '@/data/projects'

/** How long the pointer has to rest on a row before it becomes the active one. */
const SETTLE_MS = 60

/**
 * "Selected work". One row is active at a time, and hover only takes effect once the pointer
 * settles, so a hand resting on the line between two rows doesn't flip them back and forth.
 */
export function ProjectList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string | null>(null)
  const timer = useRef<number>(undefined)
  const settle = (slug: string | null) => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActive(slug), SETTLE_MS)
  }
  // Keyboard focus is deliberate, so it switches right away.
  const now = (slug: string) => {
    clearTimeout(timer.current)
    setActive(slug)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    // No gap: the rows touch, so the pointer is always on one of them.
    <ul className="flex flex-col" onPointerLeave={() => settle(null)}>
      {projects.map((p) => (
        <li key={p.slug}>
          <ProjectRow
            project={p}
            active={active === p.slug}
            onPointerEnter={() => settle(p.slug)}
            onFocus={() => now(p.slug)}
            onBlur={() => settle(null)}
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * Whether a thumbnail shows its detail: while the row is active, or, on touch screens where
 * nothing hovers, from the first time it is half in view.
 */
function useShown(active: boolean) {
  const ref = useRef<HTMLSpanElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(hover: hover)').matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, on: active || seen }
}

/**
 * The thumbnail is a dithered logo until the row is active, then it wipes off to the app detail.
 * Rows with a case study link to it and show an arrow.
 */
function ProjectRow({
  project,
  active,
  ...handlers
}: {
  project: Project
  active: boolean
  onPointerEnter: () => void
  onFocus: () => void
  onBlur: () => void
}) {
  const { thumb, caseStudy } = project
  const detail = hasWorkDetail(project.slug)
  const shown = useShown(active)
  // Where the pointer is, so the thumbnail opens from the side the hand came in.
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const track = (e: React.PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY }
  }

  const body: ReactNode = (
    <>
      <span
        ref={shown.ref}
        className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg outline outline-1 outline-edge -outline-offset-1 max-sm:h-16 max-sm:w-24"
      >
        {detail && <WorkDetail slug={project.slug} on={shown.on} />}
        {/* With a detail underneath, the dithered logo wipes off to it in the shader, with the
            same dithered edge as the colour reveal; without one, the logo wipes to colour. */}
        <DitherImage
          {...thumb}
          revealed={detail ? shown.on : active}
          clear={detail}
          pointer={detail ? pointer : undefined}
          className="absolute inset-0"
        />
      </span>
      <div className="min-w-0 flex-1">
        {/* The year shares the title's baseline. */}
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-list text-fg">{project.name}</span>
          <span className="shrink-0 text-ui text-subtle tabular-nums">{project.years}</span>
        </div>
        <p className="text-ui text-muted">{project.summary}</p>
        {/* Tags, and under the year the arrow that says the row opens a case study. */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-meta text-subtle">{project.tags.join(' · ')}</p>
          {caseStudy && (
            <ArrowUpRight
              size={15}
              aria-hidden
              className="shrink-0 text-fg opacity-0 transition-opacity duration-150 ease-(--ease-out) group-data-active:opacity-100 max-sm:hidden"
            />
          )}
        </div>
      </div>
    </>
  )

  // Background, arrow and thumbnail all follow `active`, so they always change together.
  // The background is its own layer that only fades: changing background-color repaints the page
  // layer, and next to the WebGL thumbs Chrome would sometimes show a stale frame of it.
  const props = {
    className:
      'group relative isolate flex items-center gap-[18px] rounded-xl px-2.5 py-3 before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-well before:opacity-0 before:transition-opacity before:duration-150 before:will-change-[opacity] data-active:before:opacity-100 max-sm:gap-3.5',
    'data-active': active ? '' : undefined,
    onPointerMove: track,
    ...handlers,
    onPointerEnter: (e: React.PointerEvent) => {
      track(e)
      handlers.onPointerEnter()
    },
  }

  return caseStudy ? (
    <Link to="/work/$slug" params={{ slug: project.slug }} {...props}>
      {body}
    </Link>
  ) : (
    <div {...props}>{body}</div>
  )
}
