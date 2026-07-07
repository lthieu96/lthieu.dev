'use client'

import { useEffect, useState } from 'react'

const pad = (value: number) => String(Math.max(0, Math.round(value))).padStart(4, '0')

/** Live pointer position readout, like the coordinate bar of a CAD viewport. */
export function CursorCoords() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let raf = 0
    const handleMove = (event: MouseEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setPos({ x: event.clientX, y: event.clientY })
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <span
      aria-hidden="true"
      className="hidden font-mono text-[10px] tracking-[0.14em] text-muted-foreground tabular-nums select-none lg:inline"
    >
      X {pad(pos.x)} · Y {pad(pos.y)}
    </span>
  )
}
