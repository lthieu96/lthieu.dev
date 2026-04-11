'use client'

import { HalftoneDots } from '@paper-design/shaders-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AvatarShader } from '@/components/avatar-shader'

const DEBUG_LENS = false
const LENS = 76
const LENS_BORDER_OFFSET = 1
const HALFTONE_SIZE_BASE = 0.05
const HALFTONE_SIZE_AMPLITUDE = 0.65
const HALFTONE_RANDOM_INTERVAL_MS = 140
const IMAGE_SCALE = 1.3
const IMAGE_CONTAINER = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
} as const
const IMAGE_CLASS_NAME = 'object-contain object-bottom contrast-110'

interface CanvasConfig {
  w: number
  h: number
  /** top-left offset of the canvas in card coordinates */
  x: number
  y: number
}

/**
 * Compute the avatar container box in card coordinates.
 * The shader inside the lens uses the same contain/scale/bottom alignment
 * as the avatar image, so it only needs the real container frame.
 */
function computeCanvas(card: HTMLDivElement): CanvasConfig {
  const innerW = card.clientWidth
  const innerH = card.clientHeight
  return {
    x: IMAGE_CONTAINER.left * innerW,
    y: IMAGE_CONTAINER.top * innerH,
    w: innerW - (IMAGE_CONTAINER.left + IMAGE_CONTAINER.right) * innerW,
    h: innerH - (IMAGE_CONTAINER.top + IMAGE_CONTAINER.bottom) * innerH,
  }
}

function positionLens(
  lens: HTMLDivElement,
  wrap: HTMLDivElement,
  cfg: CanvasConfig,
  x: number,
  y: number,
) {
  lens.style.left = `${x - LENS / 2 - LENS_BORDER_OFFSET}px`
  lens.style.top = `${y - LENS / 2 - LENS_BORDER_OFFSET}px`
  wrap.style.transform = `translate(${cfg.x - x + LENS / 2}px, ${cfg.y - y + LENS / 2}px)`
}

function getRelativePoint(card: HTMLDivElement, clientX: number, clientY: number) {
  const rect = card.getBoundingClientRect()

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

export function AvatarCard() {
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig | null>(null)
  const [halftoneSize, setHalftoneSize] = useState(HALFTONE_SIZE_BASE)
  const canvasConfigRef = useRef<CanvasConfig | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const halftoneWrapRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const lensVisible = DEBUG_LENS || canvasConfig !== null

  useEffect(() => {
    if (!lensVisible) return

    const updateRandomSize = () => {
      const randomOffset = Math.random() * HALFTONE_SIZE_AMPLITUDE
      setHalftoneSize(Number((HALFTONE_SIZE_BASE + randomOffset).toFixed(4)))
    }

    updateRandomSize()
    const intervalId = window.setInterval(updateRandomSize, HALFTONE_RANDOM_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [lensVisible])

  useEffect(() => {
    if (lensVisible) return

    setHalftoneSize(HALFTONE_SIZE_BASE)
  }, [lensVisible])

  useEffect(() => {
    if (!DEBUG_LENS || !cardRef.current) return

    const config = computeCanvas(cardRef.current)
    canvasConfigRef.current = config
    setCanvasConfig(config)
  }, [])

  useEffect(() => {
    if (
      !DEBUG_LENS ||
      !canvasConfig ||
      !cardRef.current ||
      !lensRef.current ||
      !halftoneWrapRef.current
    )
      return

    positionLens(
      lensRef.current,
      halftoneWrapRef.current,
      canvasConfig,
      cardRef.current.clientWidth / 2,
      cardRef.current.clientHeight / 2,
    )
  }, [canvasConfig])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const config = computeCanvas(e.currentTarget)
    canvasConfigRef.current = config
    setCanvasConfig(config)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const lens = lensRef.current
    const wrap = halftoneWrapRef.current
    const cfg = canvasConfigRef.current
    if (!lens || !wrap || !cfg) return

    const rect = cardRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    positionLens(lens, wrap, cfg, x, y)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (DEBUG_LENS) return

    setCanvasConfig(null)
    canvasConfigRef.current = null
  }, [])

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return

    const config = computeCanvas(e.currentTarget)
    canvasConfigRef.current = config
    setCanvasConfig(config)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    const lens = lensRef.current
    const wrap = halftoneWrapRef.current

    if (!card || !lens || !wrap) return

    let cfg = canvasConfigRef.current

    if (!cfg) {
      cfg = computeCanvas(card)
      canvasConfigRef.current = cfg
      setCanvasConfig(cfg)
    }

    const { x, y } = getRelativePoint(card, e.clientX, e.clientY)
    positionLens(lens, wrap, cfg, x, y)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return

    const card = e.currentTarget
    const config = computeCanvas(card)
    canvasConfigRef.current = config
    setCanvasConfig(config)

    requestAnimationFrame(() => {
      const lens = lensRef.current
      const wrap = halftoneWrapRef.current
      if (!lens || !wrap) return

      const { x, y } = getRelativePoint(card, e.clientX, e.clientY)
      positionLens(lens, wrap, config, x, y)
    })
  }, [])

  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (DEBUG_LENS) return
    if (e.pointerType !== 'mouse') return

    setCanvasConfig(null)
    canvasConfigRef.current = null
  }, [])

  const handlePointerEnd = useCallback(() => {
    if (DEBUG_LENS) return

    setCanvasConfig(null)
    canvasConfigRef.current = null
  }, [])

  return (
    <div className="relative w-full max-w-[250px] overflow-clip p-2">
      <AvatarShader />

      <div
        ref={cardRef}
        className="relative aspect-4/5 overflow-hidden rounded-sm border border-black/8 bg-[#ecebe7] shadow-[0_24px_80px_rgba(15,15,15,0.12)] dark:border-white/8 dark:bg-[#1c1c1a]"
        style={{
          cursor: canvasConfig && !DEBUG_LENS ? 'none' : undefined,
          touchAction: 'manipulation',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.92),rgba(255,255,255,0.52)_36%,transparent_74%)] dark:bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_36%,transparent_74%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat opacity-[0.16] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '300px 300px',
          }}
        />

        <div className="absolute" style={IMAGE_CONTAINER}>
          <Image
            src="/avatar.png"
            alt="Portrait of Hieu Le"
            fill
            priority
            sizes="150px"
            className={IMAGE_CLASS_NAME}
            style={{ transform: `scale(${IMAGE_SCALE})` }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/5 to-transparent dark:from-black/28 dark:via-black/10" />

        <AnimatePresence>
          {canvasConfig && (
            <motion.div
              ref={lensRef}
              className="pointer-events-none absolute z-20 overflow-hidden rounded-full border border-black/20 shadow-[0_2px_16px_rgba(0,0,0,0.24)] dark:border-white/20"
              style={{ width: LENS, height: LENS, top: 0, left: 0 }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {/* Canvas sized to match the exact rendered image region */}
              <div
                ref={halftoneWrapRef}
                style={{
                  position: 'absolute',
                  top: canvasConfig.y,
                  left: canvasConfig.x,
                  width: canvasConfig.w,
                  height: canvasConfig.h,
                  willChange: 'transform',
                }}
              >
                <HalftoneDots
                  image="/avatar.png"
                  style={{ width: '100%', height: '100%' }}
                  fit="contain"
                  scale={IMAGE_SCALE}
                  originY={1}
                  colorBack="#141414"
                  colorFront={isDark ? '#8ec5ff' : '#cfd8f3'}
                  originalColors={false}
                  type="holes"
                  grid="square"
                  inverted={true}
                  size={halftoneSize}
                  radius={0.8}
                  contrast={1}
                  grainMixer={0.19}
                  grainOverlay={0.3}
                  grainSize={0.5}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
