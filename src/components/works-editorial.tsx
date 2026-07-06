'use client'

import { ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { SectionLabel } from '@/components/section-label'
import { ShowcaseViewer } from '@/components/showcase-viewer'
import { type ShowcaseProject, showcaseProjects } from '@/data/showcase'

const EASE = [0.22, 1, 0.36, 1] as const

function getProjectCover(project: ShowcaseProject) {
  const cover = project.media.find((item) => item.type === 'image') ?? project.media[0]
  return cover.type === 'image' ? { src: cover.src, alt: cover.alt } : { src: cover.poster, alt: cover.alt }
}

function WorkRow({
  project,
  index,
  onOpen,
  onHover,
}: {
  project: ShowcaseProject
  index: number
  onOpen: (projectIndex: number) => void
  onHover: (projectIndex: number | null) => void
}) {
  const cover = getProjectCover(project)

  return (
    <motion.button
      type="button"
      className="group w-full border-t border-[color:var(--layout-line)] py-8 text-left last:border-b sm:py-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
      onClick={() => onOpen(index)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
    >
      <div className="grid items-center gap-x-8 gap-y-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]">
        <span className="hidden font-mono text-sm text-accent-brand sm:block">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0">
          {/* Static cover on touch layouts — the floating preview is pointer-only */}
          <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-lg border border-[color:var(--layout-line)] lg:hidden">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 0px"
              className="object-cover object-top"
            />
          </div>

          <h3 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.95] text-foreground uppercase transition-colors duration-300 group-hover:text-accent-brand">
            {project.title}
          </h3>
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {project.role} · {project.period} · {project.tags.join(' / ')}
          </p>
        </div>

        <span className="hidden size-12 items-center justify-center rounded-full border border-[color:var(--layout-line)] text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:border-accent-brand group-hover:text-accent-brand sm:inline-flex">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </motion.button>
  )
}

export function WorksEditorial() {
  const [viewerProjectIndex, setViewerProjectIndex] = useState<number | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const previewX = useSpring(mouseX, { stiffness: 260, damping: 28, mass: 0.6 })
  const previewY = useSpring(mouseY, { stiffness: 260, damping: 28, mass: 0.6 })

  const activeProject =
    viewerProjectIndex === null ? null : (showcaseProjects[viewerProjectIndex] ?? null)
  const hoveredProject = hoveredIndex === null ? null : (showcaseProjects[hoveredIndex] ?? null)

  const openViewer = (projectIndex: number) => {
    setViewerProjectIndex(projectIndex)
    setActiveMediaIndex(0)
  }

  return (
    <>
      <section
        className="container-editorial page-gutter py-20 sm:py-28"
        onMouseMove={(event) => {
          mouseX.set(event.clientX)
          mouseY.set(event.clientY)
        }}
      >
        <SectionLabel index="02" title="Selected works" />

        <div className="mt-10">
          {showcaseProjects.map((project, index) => (
            <WorkRow
              key={project.slug}
              project={project}
              index={index}
              onOpen={openViewer}
              onHover={setHoveredIndex}
            />
          ))}
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Click a project to browse screens &amp; walkthroughs
        </p>
      </section>

      {/* Cursor-following preview — desktop pointers only */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[80] hidden lg:block"
        style={{ x: previewX, y: previewY }}
        aria-hidden="true"
      >
        <AnimatePresence>
          {hoveredProject ? (
            <motion.div
              key={hoveredProject.slug}
              className="relative w-[360px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-[color:var(--layout-line)] bg-background shadow-[0_28px_90px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={getProjectCover(hoveredProject).src}
                  alt=""
                  fill
                  sizes="360px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex items-center justify-between border-t border-[color:var(--layout-line)] px-4 py-2.5">
                <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  {hoveredProject.media.length} media
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-accent-brand uppercase">
                  View →
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

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
