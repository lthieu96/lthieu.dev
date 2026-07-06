'use client'

import { ChevronLeft, ChevronRight, GripVertical, Maximize2, Minimize2, Play, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { type ShowcaseMedia, type ShowcaseProject } from '@/data/showcase'
import { cn } from '@/lib/utils'
import { ShaderBackground } from './shader-background'
import { Button } from './ui/button'

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
  const modalRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)
  const resizeEndedAtRef = useRef(0)
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

  const handleBackdropClick = () => {
    if (isResizingRef.current || Date.now() - resizeEndedAtRef.current < 350) {
      return
    }

    onClose()
  }

  const handleResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (window.innerWidth < 640 || !modalRef.current) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)

    isResizingRef.current = true

    const startX = event.clientX
    const startWidth = modalRef.current.getBoundingClientRect().width
    const viewportPadding = window.innerWidth >= 640 ? 32 : 16
    const maxWidth = window.innerWidth - viewportPadding
    const minWidth = Math.min(880, maxWidth)

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + (moveEvent.clientX - startX)),
      )
      setModalWidth(nextWidth)
    }

    const handlePointerEnd = (endEvent: PointerEvent) => {
      endEvent.preventDefault()
      endEvent.stopPropagation()
      isResizingRef.current = false
      resizeEndedAtRef.current = Date.now()
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
      onClick={handleBackdropClick}
    >
      <motion.div
        ref={modalRef}
        className={cn(
          'relative flex h-[min(980px,calc(100vh-0.25rem))] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-background shadow-[0_32px_120px_rgba(0,0,0,0.28)]',
          'sm:max-h-[calc(100vh-0.5rem)] sm:min-h-[760px] sm:min-w-[780px]',
          modalWidth
            ? 'max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]'
            : 'max-w-[min(1360px,calc(100vw-1rem))] sm:max-w-[min(1360px,calc(100vw-2rem))]',
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
            <h3 className="mt-1 font-display text-[28px] leading-none text-foreground">
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
