'use client'

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Maximize2,
  Minimize2,
  Play,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { type ShowcaseMedia, type ShowcaseProject, showcaseProjects } from '@/data/showcase'
import { cn } from '@/lib/utils'
import { Section } from './section'
import { ShaderBackground } from './shader-background'
import { Button } from './ui/button'

function getProjectCover(project: ShowcaseProject) {
  return project.media.find((item) => item.type === 'image') ?? project.media[0]
}

function ShowcaseCard({
  project,
  index,
  onOpen,
}: {
  project: ShowcaseProject
  index: number
  onOpen: (projectIndex: number) => void
}) {
  const cover = getProjectCover(project)

  return (
    <motion.button
      type="button"
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-sm border border-[color:var(--layout-line)] bg-background/95 text-left',
        'shadow-[0_14px_48px_rgba(15,15,15,0.04)]',
        'transition-[border-color,background-color] duration-300 ease-out',
        'hover:border-foreground/20 hover:bg-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
      )}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        boxShadow: '0 24px 72px rgba(15,15,15,0.1)',
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(index)}
    >
      <div className="relative aspect-[11/8] overflow-hidden border-b border-[color:var(--layout-line)] bg-[#f6f7fb] dark:bg-[#151923]">
        <ShaderBackground
          speed={0.8}
          scale={0.26}
          size={0.5}
          lightColorBack="#f6f8fe"
          lightColorFront="#d5ddf1"
          darkColorBack="#0f141e"
          darkColorFront="#182033"
          bgLight="#f6f7fb"
          bgDark="#131821"
          darkOpacity={0.6}
        />

        <div className="absolute inset-x-2.5 bottom-2.5 top-3 overflow-hidden rounded-[12px] border border-black/8 bg-white/92 shadow-[0_18px_40px_rgba(20,20,20,0.08)] dark:border-white/10 dark:bg-[#0f1117]">
          {cover.type === 'image' ? (
            <div className="relative h-full w-full">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top"
              />
            </div>
          ) : (
            <video
              poster={cover.poster}
              muted
              playsInline
              preload="metadata"
              src={cover.src}
              className="h-full w-full object-cover object-top"
            />
          )}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-white/10 dark:from-black/16 dark:via-transparent dark:to-white/4"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 0.25 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/35 via-background/8 to-transparent dark:from-black/35 dark:via-black/10" />

        <div className="absolute left-2 top-2 inline-flex items-center gap-2 rounded-full border border-black/8 bg-background/85 px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase backdrop-blur-sm dark:border-white/10">
          <span>{project.period}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <h3 className="font-serif text-[24px] leading-none text-foreground">{project.title}</h3>

        <div className="flex items-start justify-between gap-4">
          <motion.div
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--layout-line)] text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
            initial={false}
            whileHover={{ x: 2, y: -2, rotate: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArrowRight className="size-4" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}

function MediaStage({ media }: { media: ShowcaseMedia }) {
  if (media.type === 'video') {
    return (
      // biome-ignore lint/a11y/useMediaCaption: caption tracks will ship alongside future showcase video assets.
      <video
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
        src={media.src}
        className="h-full w-full object-contain"
      />
    )
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes="(max-width: 1024px) 100vw, 70vw"
      className="object-contain"
    />
  )
}

function ShowcaseViewer({
  project,
  activeIndex,
  onSelect,
  onClose,
}: {
  project: ShowcaseProject | null
  activeIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [isStageFullscreen, setIsStageFullscreen] = useState(false)
  const [modalWidth, setModalWidth] = useState<number | null>(null)

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!project) return

    if (event.key === 'Escape') {
      onClose()
      return
    }

    if (event.key === 'ArrowRight') {
      onSelect((activeIndex + 1) % project.media.length)
      return
    }

    if (event.key === 'ArrowLeft') {
      onSelect((activeIndex - 1 + project.media.length) % project.media.length)
    }
  })

  useEffect(() => {
    if (!project) return

    const previousOverflow = document.body.style.overflow
    const noiseOverlay = document.getElementById('global-noise-overlay')
    const previousNoiseOpacity = noiseOverlay?.style.opacity
    document.body.style.overflow = 'hidden'
    if (noiseOverlay) {
      noiseOverlay.style.opacity = '0'
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      if (noiseOverlay) {
        noiseOverlay.style.opacity = previousNoiseOpacity ?? ''
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [project])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsStageFullscreen(document.fullscreenElement === stageRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!project) return null

  const activeMedia = project.media[activeIndex]
  const selectPrevious = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    onSelect((activeIndex - 1 + project.media.length) % project.media.length)
  }

  const selectNext = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    onSelect((activeIndex + 1) % project.media.length)
  }

  const toggleStageFullscreen = async () => {
    const stage = stageRef.current
    if (!stage) return

    if (document.fullscreenElement === stage) {
      await document.exitFullscreen()
      return
    }

    await stage.requestFullscreen()
  }

  const handleResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (window.innerWidth < 640 || !modalRef.current) return

    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startWidth = modalRef.current.getBoundingClientRect().width
    const viewportPadding = window.innerWidth >= 640 ? 32 : 16
    const minWidth = 880
    const maxWidth = Math.min(1360, window.innerWidth - viewportPadding)

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + (moveEvent.clientX - startX)),
      )
      setModalWidth(nextWidth)
    }

    const handlePointerEnd = () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)
  }

  return (
    <motion.div
      key={project.slug}
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/45 p-2 backdrop-blur-md sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        className={cn(
          'relative flex h-[min(980px,calc(100vh-0.25rem))] w-full max-w-[min(1360px,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-background shadow-[0_32px_120px_rgba(0,0,0,0.28)]',
          'sm:max-h-[calc(100vh-0.5rem)] sm:max-w-[min(1360px,calc(100vw-2rem))] sm:min-h-[760px] sm:min-w-[780px]',
        )}
        style={modalWidth ? { width: `${modalWidth}px` } : undefined}
        initial={{ opacity: 0, y: 18, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.996 }}
        transition={{
          opacity: { duration: 0.16, ease: [0.32, 0.72, 0, 1] },
          y: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 },
          scale: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Resize showcase width"
          className="absolute top-1/2 right-0 z-30 hidden -translate-y-1/2 translate-x-1/2 cursor-ew-resize sm:flex"
          onPointerDown={handleResizeStart}
        >
          <span className="flex h-16 w-6 items-center justify-center rounded-full border border-black/8 bg-white text-muted-foreground shadow-[0_12px_30px_rgba(15,15,15,0.12)] transition-colors duration-200 hover:bg-muted dark:border-white/12 dark:bg-[#11151d] dark:hover:bg-[#171d27]">
            <GripVertical className="size-4" />
          </span>
        </button>

        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--layout-line)] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              {project.role} · {project.period}
            </p>
            <h3 className="mt-1 font-serif text-[28px] leading-none text-foreground">
              {project.title}
            </h3>
            <p className="mt-2 max-w-[56ch] text-sm leading-6 text-muted-foreground">
              {project.summary}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={toggleStageFullscreen}
            >
              {isStageFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
              <span className="sr-only">
                {isStageFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="size-4" />
              <span className="sr-only">Close showcase</span>
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative min-h-[360px] border-b border-[color:var(--layout-line)] bg-[#f6f7fb] dark:bg-[#131821] lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <ShaderBackground
              speed={0.9}
              scale={0.25}
              size={0.54}
              lightColorBack="#f7f9ff"
              lightColorFront="#d1d9ef"
              darkColorBack="#0f141d"
              darkColorFront="#1a2234"
              bgLight="#f6f7fb"
              bgDark="#131821"
              darkOpacity={0.58}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),rgba(255,255,255,0.2)_32%,transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_32%,transparent_68%)]" />

            <div className="absolute inset-0 p-2 sm:p-3">
              <div
                ref={stageRef}
                className="relative h-full overflow-hidden rounded-xl border border-black/8 bg-white shadow-[0_20px_48px_rgba(20,20,20,0.1)] dark:border-white/8 dark:bg-[#0e1219]"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`${project.slug}-${activeMedia.src}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0.92 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.92 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MediaStage media={activeMedia} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {project.media.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute inset-y-0 left-4 z-10 my-auto size-9 rounded-full border-black/8 bg-white/88 text-foreground shadow-[0_10px_30px_rgba(15,15,15,0.08)] backdrop-blur-md transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-black/12 hover:bg-white hover:shadow-[0_14px_34px_rgba(15,15,15,0.12)] dark:border-white/12 dark:bg-black/42 dark:text-white dark:hover:border-white/18 dark:hover:bg-black/56 dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.32)]"
                  onClick={selectPrevious}
                >
                  <ChevronLeft className="size-4.5" />
                  <span className="sr-only">Previous media</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute inset-y-0 right-4 z-10 my-auto size-9 rounded-full border-black/8 bg-white/88 text-foreground shadow-[0_10px_30px_rgba(15,15,15,0.08)] backdrop-blur-md transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-black/12 hover:bg-white hover:shadow-[0_14px_34px_rgba(15,15,15,0.12)] dark:border-white/12 dark:bg-black/42 dark:text-white dark:hover:border-white/18 dark:hover:bg-black/56 dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.32)]"
                  onClick={selectNext}
                >
                  <ChevronRight className="size-4.5" />
                  <span className="sr-only">Next media</span>
                </Button>
              </>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col bg-background">
            <div className="border-b border-[color:var(--layout-line)] px-4 py-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:px-5">
              {activeIndex + 1} / {project.media.length}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <div className="grid gap-3">
                {project.media.map((media, index) => (
                  <button
                    key={media.src}
                    type="button"
                    className={cn(
                      'group relative overflow-hidden rounded-xl border text-left transition-all duration-200',
                      index === activeIndex
                        ? 'border-foreground/18 bg-muted shadow-[0_10px_30px_rgba(15,15,15,0.08)]'
                        : 'border-[color:var(--layout-line)] bg-background hover:border-foreground/14 hover:bg-muted/50',
                    )}
                    onClick={() => onSelect(index)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {media.type === 'image' ? (
                        <Image
                          src={media.src}
                          alt={media.alt}
                          fill
                          sizes="220px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <>
                          <Image
                            src={media.poster}
                            alt={media.alt}
                            fill
                            sizes="220px"
                            className="object-cover object-center"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm">
                              <Play className="ml-0.5 size-4 fill-current" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {media.type === 'image' ? `Screen ${index + 1}` : `Clip ${index + 1}`}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {media.type === 'image' ? 'Image' : 'Video'}
                        </p>
                      </div>
                      {media.type === 'video' ? (
                        <span className="inline-flex size-7 items-center justify-center rounded-full border border-[color:var(--layout-line)] text-muted-foreground">
                          <Play className="ml-0.5 size-3 fill-current" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ShowcaseSection() {
  const [viewerProjectIndex, setViewerProjectIndex] = useState<number | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)

  const activeProject =
    viewerProjectIndex === null ? null : (showcaseProjects[viewerProjectIndex] ?? null)

  const openViewer = (projectIndex: number) => {
    setViewerProjectIndex(projectIndex)
    setActiveMediaIndex(0)
  }

  return (
    <>
      <Section>
        <div className="overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-5 sm:mb-6">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Selected Showcase
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {showcaseProjects.map((project, index) => (
              <div key={project.slug}>
                <ShowcaseCard project={project} index={index} onOpen={openViewer} />
              </div>
            ))}
          </div>
        </div>
      </Section>

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
