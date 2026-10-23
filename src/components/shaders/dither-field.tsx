import { type PaperShaderElement, ShaderMount } from '@paper-design/shaders-react'
import { useEffect, useMemo, useRef } from 'react'
import { cssColor, useTheme } from '@/lib/theme'
import { useMediaQuery, useReducedMotion } from '@/lib/use-media-query'
import fragmentShader from './dither-field.frag?raw'

type Props = {
  /** Half-width (CSS px) of the clear area in the middle. 0 clears only a thin centre line. */
  colHalf?: number
  feather?: number
  inkStrength?: number
  /** Colour token (from app.css) the field fades into. */
  background?: 'bg' | 'media'
  className?: string
}

/**
 * Slow dithered noise that stays out of the middle, so text on top stays readable.
 * Accepted values from the design review: 2px cells, ~18% ink.
 */
export function DitherField({
  colHalf = 340,
  feather = 96,
  inkStrength = 0.18,
  background = 'bg',
  className,
}: Props) {
  const reduced = useReducedMotion()
  const theme = useTheme()
  const ref = useRef<PaperShaderElement>(null)
  // Recomputed on theme change; `theme` is only a dependency, cssColor reads the live tokens.
  const uniforms = useMemo(
    () => ({
      u_cell: 2,
      u_density: 0.6,
      // Dark dots on paper read stronger than light dots on black.
      u_inkStrength: theme === 'light' ? inkStrength * 0.7 : inkStrength,
      u_speed: 0.02,
      u_colHalf: colHalf,
      u_feather: feather,
      u_bg: cssColor(background),
      u_ink: cssColor('fg'),
      u_mouse: [-1e4, -1e4],
    }),
    [colHalf, feather, inkStrength, background, theme],
  )

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      el.paperShaderMount?.setUniforms({ u_mouse: [e.clientX - r.left, e.clientY - r.top] })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  return (
    <ShaderMount
      ref={ref}
      aria-hidden
      className={`pointer-events-none animate-[fade-in_1200ms_var(--ease-out)_both] ${className}`}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      speed={reduced ? 0 : 1}
    />
  )
}

/** The page background: fixed behind the 600px column. Skipped on narrow screens (no margins). */
export function PageDither() {
  const wide = useMediaQuery('(min-width: 768px)')
  return wide ? <DitherField className="fixed inset-0 -z-10" /> : null
}
