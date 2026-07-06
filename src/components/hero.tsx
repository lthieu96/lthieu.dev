'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CurrentTime } from '@/components/current-time'
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
        <span>Portfolio — 2026</span>
        <span className="hidden sm:inline">Fullstack Developer</span>
        <span>
          Saigon <CurrentTime />
        </span>
      </motion.div>

      <div className="my-8">
        <h1 className="font-display text-[clamp(5rem,24vw,17rem)] leading-[0.85] tracking-[-0.015em] text-foreground uppercase">
          <RevealLine delay={0.2} ready={ready}>
            Hieu
          </RevealLine>
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
                className="size-14 shrink-0 rounded-full border border-[color:var(--layout-line)] object-cover grayscale transition-[filter] duration-500 hover:grayscale-0 sm:size-16"
              />
              <p className="font-sans text-sm leading-6 tracking-normal text-muted-foreground">
                Building web products end to end — from user-facing interfaces to the dashboards
                and systems behind them.
              </p>
            </motion.div>
          </div>
        </h1>
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
