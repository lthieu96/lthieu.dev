'use client'

import { ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { CrossMark } from '@/components/cross-mark'
import { SectionLabel } from '@/components/section-label'
import { ShowcaseViewer } from '@/components/showcase-viewer'
import { type ShowcaseProject, showcaseProjects } from '@/data/showcase'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

function getProjectCover(project: ShowcaseProject) {
  const cover = project.media.find((item) => item.type === 'image') ?? project.media[0]
  return cover.type === 'image'
    ? { src: cover.src, alt: cover.alt }
    : { src: cover.poster, alt: cover.alt }
}

function WorkRow({
  project,
  index,
  active,
  onOpen,
  onActivate,
}: {
  project: ShowcaseProject
  index: number
  active: boolean
  onOpen: (projectIndex: number) => void
  onActivate: (projectIndex: number) => void
}) {
  const cover = getProjectCover(project)

  return (
    <motion.button
      type="button"
      className="relative w-full border-t border-[color:var(--layout-line)] py-7 text-left last:border-b sm:py-9"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
      onClick={() => onOpen(index)}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
    >
      {/* hatched section-cut bar marks the active row */}
      <span
        aria-hidden="true"
        className={cn(
          'hatch absolute inset-y-2 left-0 w-2 border-r border-[color:var(--layout-line)] transition-opacity duration-300',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="flex items-baseline gap-4 pl-4 sm:gap-6 sm:pl-6">
        <span
          className={cn(
            'font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-300',
            active ? 'text-accent-brand' : 'text-muted-foreground',
          )}
        >
          Fig. {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          {/* Static cover on touch layouts — the sticky preview is desktop-only */}
          <div className="relative mb-5 aspect-[16/9] overflow-hidden border border-[color:var(--layout-line)] lg:hidden">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 0px"
              className="object-cover object-top"
            />
          </div>

          <h3
            className={cn(
              'font-display text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-bold uppercase transition-[color,translate] duration-300',
              active ? 'translate-x-1.5 text-accent-brand' : 'text-foreground',
            )}
          >
            {project.title}
          </h3>
          <p className="mt-2.5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {project.role} · {project.period}
          </p>
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground/70 uppercase">
            {project.tags.join(' / ')}
          </p>
        </div>

        <span
          className={cn(
            'hidden size-11 shrink-0 items-center justify-center self-center border transition-all duration-300 sm:inline-flex',
            active
              ? 'rotate-45 border-accent-brand text-accent-brand'
              : 'border-[color:var(--layout-line)] text-muted-foreground',
          )}
        >
          <ArrowUpRight className="size-4.5" />
        </span>
      </div>
    </motion.button>
  )
}

export function WorksTechnical() {
  const [viewerProjectIndex, setViewerProjectIndex] = useState<number | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  // Preview target — always set, so the panel never unmounts (no flicker)
  const [activeIndex, setActiveIndex] = useState(0)

  const activeProject =
    viewerProjectIndex === null ? null : (showcaseProjects[viewerProjectIndex] ?? null)
  const previewProject = showcaseProjects[activeIndex]
  const previewCover = getProjectCover(previewProject)

  const openViewer = (projectIndex: number) => {
    setViewerProjectIndex(projectIndex)
    setActiveMediaIndex(0)
  }

  return (
    <>
      <section className="container-editorial page-gutter py-20 sm:py-28">
        <SectionLabel index="02" title="Figures — Selected works" />

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            {showcaseProjects.map((project, index) => (
              <WorkRow
                key={project.slug}
                project={project}
                index={index}
                active={index === activeIndex}
                onOpen={openViewer}
                onActivate={setActiveIndex}
              />
            ))}

            <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Click a figure to browse screens &amp; walkthroughs
            </p>
          </div>

          {/* Sticky preview panel — a small drawing sheet that crossfades per hovered row */}
          <motion.button
            type="button"
            aria-label={`Open ${previewProject.title} showcase`}
            onClick={() => openViewer(activeIndex)}
            className="group hidden overflow-hidden border border-[color:var(--layout-line)] bg-card text-left transition-colors duration-300 hover:border-accent-brand/60 lg:sticky lg:top-24 lg:block"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            {/* sheet header strip */}
            <div className="flex items-center justify-between border-b border-[color:var(--layout-line)] px-4 py-2">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Detail view · Scale 1:2
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                DWG 02-{String(activeIndex + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={previewProject.slug}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.045 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Image
                    src={previewCover.src}
                    alt={previewCover.alt}
                    fill
                    sizes="(max-width: 1024px) 0px, 45vw"
                    className="object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>

              {/* registration marks over the figure */}
              <div className="pointer-events-none absolute inset-0 text-white/70 mix-blend-difference">
                <CrossMark className="top-2 left-2" />
                <CrossMark className="top-2 right-2" />
                <CrossMark className="bottom-2 left-2" />
                <CrossMark className="right-2 bottom-2" />
              </div>

              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            {/* title block strip */}
            <div className="grid grid-cols-[1fr_auto_auto] divide-x divide-[color:var(--layout-line)] border-t border-[color:var(--layout-line)]">
              <div className="flex min-w-0 items-baseline gap-3 px-4 py-3">
                <span className="font-mono text-[11px] tracking-[0.14em] text-accent-brand uppercase">
                  Fig. {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    key={previewProject.slug}
                    className="truncate font-display text-lg leading-none font-bold text-foreground uppercase"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    {previewProject.title}
                  </motion.span>
                </AnimatePresence>
              </div>

              <span className="flex items-center px-4 py-3 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {previewProject.media.length} media
              </span>
              <span className="flex items-center px-4 py-3 font-mono text-[10px] tracking-[0.16em] text-accent-brand uppercase transition-transform duration-200 group-hover:translate-x-0.5">
                View →
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeProject ? (
          <ShowcaseViewer
            key={activeProject.slug}
            project={activeProject}
            activeIndex={activeMediaIndex}
            onSelect={setActiveMediaIndex}
            onClose={() => setViewerProjectIndex(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
