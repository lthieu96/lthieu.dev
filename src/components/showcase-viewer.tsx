'use client'

import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { ShowcaseMedia, ShowcaseProject } from '@/data/showcase'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

const EASE = [0.22, 1, 0.36, 1] as const

// Directional slide — next media enters from the right, previous from the left
const stageVariants = {
  enter: (direction: number) => ({ x: direction * 56, opacity: 0, scale: 0.985 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ x: direction * -56, opacity: 0, scale: 0.985 }),
}

const stageTransition = {
  x: { type: 'spring', stiffness: 300, damping: 32, mass: 0.85 },
  opacity: { duration: 0.32, ease: EASE },
  scale: { duration: 0.32, ease: EASE },
} as const

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
    <div className="relative h-full w-full">
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes="100vw"
        className="object-contain [filter:drop-shadow(0_18px_50px_rgba(0,0,0,0.3))]"
      />
    </div>
  )
}

export function ShowcaseViewer({
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
  const stripRef = useRef<HTMLDivElement>(null)
  const [direction, setDirection] = useState(1)
  const [isStageFullscreen, setIsStageFullscreen] = useState(false)

  const navigate = useEffectEvent((nextIndex: number, dir: number) => {
    if (!project) return
    setDirection(dir)
    onSelect((nextIndex + project.media.length) % project.media.length)
  })

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!project) return

    if (event.key === 'Escape') {
      onClose()
      return
    }

    if (event.key === 'ArrowRight') {
      navigate(activeIndex + 1, 1)
      return
    }

    if (event.key === 'ArrowLeft') {
      navigate(activeIndex - 1, -1)
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

  // Keep the active thumbnail centered in the filmstrip
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const active = strip.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex])

  if (!project) return null

  const activeMedia = project.media[activeIndex]
  const total = project.media.length
  // Neighbors get preloaded invisibly so navigation never waits on the network
  const neighborImages = [
    project.media[(activeIndex + 1) % total],
    project.media[(activeIndex - 1 + total) % total],
  ].filter((media) => media.type === 'image' && media !== activeMedia)

  const toggleStageFullscreen = async () => {
    const stage = stageRef.current
    if (!stage) return

    if (document.fullscreenElement === stage) {
      await document.exitFullscreen()
      return
    }

    await stage.requestFullscreen()
  }

  return (
    <motion.div
      key={project.slug}
      className="fixed inset-0 z-[140] flex flex-col bg-background/[0.97] backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Top bar */}
      <motion.div
        className="flex items-center justify-between gap-4 border-b border-[color:var(--layout-line)] px-4 py-3.5 sm:px-7 sm:py-4"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
      >
        <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
          <h3 className="shrink-0 font-display text-xl leading-none text-foreground sm:text-2xl">
            {project.title}
          </h3>
          <p className="hidden truncate font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase md:block">
            {project.role} · {project.period}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="mr-1 font-mono text-xs text-muted-foreground tabular-nums sm:mr-2">
            {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={toggleStageFullscreen}
          >
            {isStageFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
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
      </motion.div>

      {/* Stage */}
      <motion.div
        ref={stageRef}
        className="relative min-h-0 flex-1 bg-background"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeMedia.src}
            className="absolute inset-0 p-3 sm:p-8"
            custom={direction}
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <MediaStage media={activeMedia} />
          </motion.div>
        </AnimatePresence>

        {/* Invisible neighbor preloads */}
        <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
          {neighborImages.map(
            (media) =>
              media.type === 'image' && (
                <Image key={media.src} src={media.src} alt="" width={32} height={32} />
              ),
          )}
        </div>

        {total > 1 ? (
          <>
            <button
              type="button"
              className="absolute inset-y-0 left-3 z-10 my-auto flex size-11 items-center justify-center rounded-full border border-[color:var(--layout-line)] bg-background/70 text-muted-foreground backdrop-blur-md transition-colors duration-200 hover:border-accent-brand/60 hover:text-accent-brand sm:left-5"
              onClick={() => navigate(activeIndex - 1, -1)}
            >
              <ChevronLeft className="size-5" />
              <span className="sr-only">Previous media</span>
            </button>
            <button
              type="button"
              className="absolute inset-y-0 right-3 z-10 my-auto flex size-11 items-center justify-center rounded-full border border-[color:var(--layout-line)] bg-background/70 text-muted-foreground backdrop-blur-md transition-colors duration-200 hover:border-accent-brand/60 hover:text-accent-brand sm:right-5"
              onClick={() => navigate(activeIndex + 1, 1)}
            >
              <ChevronRight className="size-5" />
              <span className="sr-only">Next media</span>
            </button>
          </>
        ) : null}
      </motion.div>

      {/* Filmstrip */}
      <motion.div
        className="border-t border-[color:var(--layout-line)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
      >
        <div
          ref={stripRef}
          className="flex gap-2.5 overflow-x-auto px-4 py-3.5 sm:px-7 sm:py-4 [scrollbar-width:thin]"
        >
          {project.media.map((media, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={media.src}
                type="button"
                data-active={isActive}
                className={cn(
                  'relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded-md border transition-all duration-300 sm:h-20',
                  isActive
                    ? 'border-accent-brand opacity-100 ring-1 ring-accent-brand/40'
                    : 'border-[color:var(--layout-line)] opacity-50 hover:opacity-90',
                )}
                onClick={() => navigate(index, Math.sign(index - activeIndex) || 1)}
              >
                <Image
                  src={media.type === 'image' ? media.src : media.poster}
                  alt={media.alt}
                  fill
                  sizes="120px"
                  className="object-cover object-top"
                />
                {media.type === 'video' ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex size-6 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-sm">
                      <Play className="ml-px size-2.5 fill-current" />
                    </span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
