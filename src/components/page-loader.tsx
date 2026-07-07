'use client'

import { useEffect, useRef, useState } from 'react'
import { CrossMark } from '@/components/cross-mark'

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
      className="fixed inset-0 z-[9999] flex flex-col bg-background"
      style={{
        opacity: hiding ? 0 : 1,
        transition: hiding ? 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        pointerEvents: hiding ? 'none' : 'all',
      }}
    >
      {/* Sheet registration marks */}
      <div className="pointer-events-none absolute inset-0 text-foreground/30">
        <CrossMark className="top-4 left-4" />
        <CrossMark className="top-4 right-4" />
        <CrossMark className="bottom-4 left-4" />
        <CrossMark className="right-4 bottom-4" />
      </div>

      {/* Top — sheet header */}
      <div className="flex items-center justify-between px-8 pt-8 sm:px-12">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          lthieu.dev
        </span>
        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Sheet 01 / 01
        </span>
      </div>

      {/* Center — large percentage */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex items-baseline font-display leading-none font-bold">
          <span
            className="text-foreground tabular-nums"
            style={{ fontSize: 'clamp(56px, 12vw, 110px)' }}
          >
            {String(progress).padStart(2, '0')}
          </span>
          <span
            className="ml-1.5 text-muted-foreground"
            style={{ fontSize: 'clamp(20px, 4vw, 36px)' }}
          >
            %
          </span>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Plotting blueprint
        </p>
      </div>

      {/* Bottom — full-width progress bar */}
      <div className="relative h-[3px] w-full bg-[color:var(--layout-line)]">
        <div
          className="absolute inset-y-0 left-0 bg-accent-brand"
          style={{
            width: `${progress}%`,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  )
}
