'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CrossMark } from '@/components/cross-mark'
import { CurrentTime } from '@/components/current-time'
import { DimensionH, DimensionV, useMeasuredSize } from '@/components/dimension-line'
import { TextFlip } from '@/components/text-flip/text-flip'

const EASE = [0.22, 1, 0.36, 1] as const

/** Waits for the page loader curtain to lift before running entrance animations. */
function useLoaderDone() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (document.documentElement.dataset.loaderDone === 'true') {
      setDone(true)
      return
    }

    const handleDone = () => setDone(true)
    window.addEventListener('page-loader:done', handleDone)
    const fallback = window.setTimeout(handleDone, 3000)

    return () => {
      window.removeEventListener('page-loader:done', handleDone)
      window.clearTimeout(fallback)
    }
  }, [])

  return done
}

function RevealLine({
  children,
  delay,
  ready,
  className,
}: {
  children: React.ReactNode
  delay: number
  ready: boolean
  className?: string
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ y: '110%' }}
        animate={ready ? { y: '0%' } : { y: '110%' }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function Hero() {
  const ready = useLoaderDone()
  const nameRef = useRef<HTMLDivElement>(null)
  const hieuRef = useRef<HTMLSpanElement>(null)
  const { width: nameWidth } = useMeasuredSize(nameRef)
  const { height: hieuHeight } = useMeasuredSize(hieuRef)

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.8, ease: EASE, delay },
  })

  return (
    <section
      id="top"
      className="container-editorial page-gutter flex min-h-svh flex-col justify-between pt-24 pb-8 sm:pt-28"
    >
      <motion.div
        className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
        {...fade(0.15)}
      >
        <span>DWG · Portfolio — 2026</span>
        <span className="hidden sm:inline">Fullstack Developer</span>
        <span>
          Saigon <CurrentTime />
        </span>
      </motion.div>

      <div className="relative my-8">
        {/* registration marks at the corners of the drawing — opacity-only so the
            absolute marks keep positioning against the section, not this wrapper */}
        <motion.div
          aria-hidden="true"
          className="text-foreground/35"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.2 }}
        >
          <CrossMark className="-top-4 -left-2" />
          <CrossMark className="-top-4 -right-2" />
          <CrossMark className="-bottom-4 -left-2" />
          <CrossMark className="-right-2 -bottom-4" />
        </motion.div>

        {/* revision stamp */}
        <motion.span
          className="absolute top-0 right-8 hidden rotate-[-8deg] border border-accent-stamp/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.24em] text-accent-stamp uppercase lg:inline-block"
          {...fade(1.35)}
        >
          Rev. A — Issued 2026
        </motion.span>

        <div ref={nameRef}>
          <h1 className="font-display text-[clamp(4.4rem,21vw,15.5rem)] leading-[0.88] font-bold tracking-[-0.03em] text-foreground uppercase">
            <div className="flex items-stretch gap-5 sm:gap-8">
              <RevealLine delay={0.2} ready={ready}>
                <span ref={hieuRef} className="block">
                  Hieu
                </span>
              </RevealLine>
              <DimensionV
                label={hieuHeight ? `H = ${hieuHeight} PX` : 'H = —'}
                ready={ready}
                delay={1.15}
                className="hidden py-1 sm:flex"
              />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
              <RevealLine delay={0.32} ready={ready}>
                Le<span className="text-accent-brand">.</span>
              </RevealLine>

              <motion.div
                className="mb-[0.18em] flex max-w-sm items-start gap-4 normal-case"
                {...fade(0.85)}
              >
                <Image
                  src="/avatar.png"
                  alt="Portrait of Hieu Le"
                  width={64}
                  height={64}
                  className="size-14 shrink-0 border border-[color:var(--layout-line)] object-cover grayscale transition-[filter] duration-500 hover:grayscale-0 sm:size-16"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-accent-brand uppercase">
                    Fig. 0 — Portrait · 1:1
                  </p>
                  <p className="mt-1.5 font-sans text-sm leading-6 tracking-normal text-muted-foreground">
                    Building web products end to end — from user-facing interfaces to the dashboards
                    and systems behind them.
                  </p>
                </div>
              </motion.div>
            </div>
          </h1>

          <DimensionH
            label={nameWidth ? `W = ${nameWidth} PX · FULL BLEED` : 'W = —'}
            ready={ready}
            delay={1.05}
            className="mt-6"
          />
        </div>
      </div>

      <motion.div
        className="flex items-end justify-between gap-6 border-t border-[color:var(--layout-line)] pt-5"
        {...fade(1)}
      >
        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-brand" />
          </span>
          Open to opportunities
        </div>

        <div className="hidden h-5 overflow-hidden md:block">
          <TextFlip
            className="font-mono text-[11px] leading-5 tracking-[0.18em] text-muted-foreground uppercase"
            interval={2.8}
          >
            <span>Next.js · NestJS · TypeScript</span>
            <span>Real-time data at scale</span>
            <span>Dashboards &amp; admin tools</span>
            <span>Web · Mobile · Tablet</span>
          </TextFlip>
        </div>

        <motion.span
          className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scroll ↓
        </motion.span>
      </motion.div>
    </section>
  )
}
