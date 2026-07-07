'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { CrossMark } from '@/components/cross-mark'

const EASE = [0.22, 1, 0.36, 1] as const

function statusLabel(progress: number) {
  if (progress < 30) return 'Calibrating grid'
  if (progress < 60) return 'Plotting axes'
  if (progress < 90) return 'Inking linework'
  return 'Finalizing sheet'
}

export function PageLoader() {
  const [progress, setProgress] = useState(0)
  const [hiding, setHiding] = useState(false)
  const [hidden, setHidden] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = Date.now()
    const phase1 = 60 // ms: 0 → 6% linear
    const phase2 = 500 // ms: 6 → 90% ease-out (starts after phase1)
    const simDuration = phase1 + phase2

    const tick = () => {
      const elapsed = Date.now() - startTime
      let value: number

      if (elapsed < phase1) {
        // Phase 1: linear 0 → 6
        value = Math.floor((elapsed / phase1) * 6)
      } else {
        // Phase 2: ease-out cubic 6 → 90
        const t = Math.min((elapsed - phase1) / phase2, 1)
        const eased = 1 - (1 - t) ** 3
        value = Math.floor(6 + eased * 84)
      }

      setProgress(value)
      if (elapsed < simDuration) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const minWait = new Promise<void>((resolve) => setTimeout(resolve, simDuration))
    const assetsReady = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve()
        else window.addEventListener('load', () => resolve(), { once: true })
      }),
    ])

    Promise.all([minWait, assetsReady]).then(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setProgress(100)
      setTimeout(() => {
        setHiding(true)
        document.documentElement.dataset.loaderDone = 'true'
        window.dispatchEvent(new Event('page-loader:done'))
        setTimeout(() => setHidden(true), 700)
      }, 200)
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-background"
      style={{
        opacity: hiding ? 0 : 1,
        transition: hiding ? 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        pointerEvents: hiding ? 'none' : 'all',
      }}
    >
      {/* Drafting grid, fading in */}
      <motion.div
        className="drafting-grid absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {/* Sheet registration marks */}
      <motion.div
        className="pointer-events-none absolute inset-0 text-foreground/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        <CrossMark className="top-6 left-6 sm:top-8 sm:left-8" />
        <CrossMark className="top-6 right-6 sm:top-8 sm:right-8" />
        <CrossMark className="bottom-6 left-6 sm:bottom-8 sm:left-8" />
        <CrossMark className="right-6 bottom-6 sm:right-8 sm:bottom-8" />
      </motion.div>

      {/* Top — sheet header */}
      <motion.div
        className="flex items-center justify-between px-8 pt-8 sm:px-12"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      >
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          lthieu.dev
        </span>
        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Sheet 01 / 01
        </span>
      </motion.div>

      {/* Center — large percentage + live plot status */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <motion.div
          className="flex items-baseline font-display leading-none font-bold"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
        >
          <span
            className="relative inline-block text-foreground tabular-nums"
            style={{ fontSize: 'clamp(56px, 12vw, 110px)' }}
          >
            {/* invisible sizer reserves the width of the widest value so 99→100 never shifts */}
            <span aria-hidden="true" className="invisible">
              100
            </span>
            <span className="absolute inset-0 text-right">
              {String(progress).padStart(2, '0')}
            </span>
          </span>
          <span
            className="ml-1.5 text-muted-foreground"
            style={{ fontSize: 'clamp(20px, 4vw, 36px)' }}
          >
            %
          </span>
        </motion.div>

        <motion.p
          className="mt-4 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          {statusLabel(progress)}
          <motion.span
            className="inline-block h-3 w-[7px] bg-accent-brand"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        </motion.p>
      </div>

      {/* Bottom — full-width progress bar with a plot-head marker */}
      <motion.div
        className="relative h-[3px] w-full bg-[color:var(--layout-line)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      >
        <div
          className="absolute inset-y-0 left-0 bg-accent-brand"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
        {/* leading-edge tick */}
        <div
          className="absolute bottom-0 h-3 w-0.5 bg-accent-brand shadow-[0_0_8px_var(--accent-brand)]"
          style={{ left: `calc(${progress}% - 1px)`, transition: 'left 0.1s linear' }}
        />
      </motion.div>
    </div>
  )
}
