'use client'

import { motion } from 'motion/react'
import { type RefObject, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/** Live-measures an element so dimension lines can display real values. */
export function useMeasuredSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function ArrowLeft() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0" aria-hidden="true">
      <path d="M0 4 L8 0.5 L8 7.5 Z" fill="currentColor" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0" aria-hidden="true">
      <path d="M8 4 L0 0.5 L0 7.5 Z" fill="currentColor" />
    </svg>
  )
}

function ArrowUp() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0" aria-hidden="true">
      <path d="M4 0 L0.5 8 L7.5 8 Z" fill="currentColor" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0" aria-hidden="true">
      <path d="M4 8 L0.5 0 L7.5 0 Z" fill="currentColor" />
    </svg>
  )
}

/** Horizontal dimension line — extension ticks, arrowheads, centered label. */
export function DimensionH({
  label,
  ready = true,
  delay = 0,
  className,
}: {
  label: string
  ready?: boolean
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn('flex items-center text-foreground/55 select-none', className)}
      initial={{ opacity: 0, scaleX: 0.96 }}
      animate={ready ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.96 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <span className="h-3.5 w-px bg-current" />
      <ArrowLeft />
      <span className="h-px min-w-2 flex-1 bg-current" />
      <span className="px-3 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase tabular-nums">
        {label}
      </span>
      <span className="h-px min-w-2 flex-1 bg-current" />
      <ArrowRight />
      <span className="h-3.5 w-px bg-current" />
    </motion.div>
  )
}

/** Vertical dimension line — reads top to bottom with a rotated label. */
export function DimensionV({
  label,
  ready = true,
  delay = 0,
  className,
}: {
  label: string
  ready?: boolean
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn('flex flex-col items-center text-foreground/55 select-none', className)}
      initial={{ opacity: 0, scaleY: 0.96 }}
      animate={ready ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.96 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <span className="h-px w-3.5 bg-current" />
      <ArrowUp />
      <span className="min-h-2 w-px flex-1 bg-current" />
      <span className="py-2 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase tabular-nums [writing-mode:vertical-rl]">
        {label}
      </span>
      <span className="min-h-2 w-px flex-1 bg-current" />
      <ArrowDown />
      <span className="h-px w-3.5 bg-current" />
    </motion.div>
  )
}
