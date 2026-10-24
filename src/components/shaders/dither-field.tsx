import { ShaderMount } from '@paper-design/shaders-react'
import { useMemo } from 'react'
import { cssColor, useTheme } from '@/lib/theme'
import { useMediaQuery, useReducedMotion } from '@/lib/use-media-query'
import fragmentShader from './dither-field.frag?raw'
import grainShader from './page-grain.frag?raw'

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
 * Slow halftone drift (45 degree print dots in soft clouds) that stays out of the middle, so
 * whatever sits on top stays readable. No pointer response.
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
  // Recomputed on theme change; `theme` is only a dependency, cssColor reads the live tokens.
  const uniforms = useMemo(
    () => ({
      u_pitch: 6,
      u_scale: 500,
      u_density: 0.5,
      // Dark dots on paper read stronger than light dots on black.
      u_inkStrength: theme === 'light' ? inkStrength * 0.7 : inkStrength,
      u_speed: 0.03,
      u_colHalf: colHalf,
      u_feather: feather,
      u_bg: cssColor(background),
      u_ink: cssColor('fg'),
    }),
    [colHalf, feather, inkStrength, background, theme],
  )

  return (
    <ShaderMount
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
  return wide ? <PageGrain /> : null
}

/**
 * Grain wash in the margins, no pointer response: a near-flat tonal wash with static 1 device px
 * grain, gathered in the sparse sweeping bands of the warp shape (design/shaders/warp-dither.glsl).
 */
function PageGrain() {
  const reduced = useReducedMotion()
  const theme = useTheme()
  // Recomputed on theme change; `theme` is only a dependency, cssColor reads the live tokens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: theme invalidates the token reads
  const uniforms = useMemo(
    () => ({
      u_warpScale: 333,
      u_inkStrength: 0.02,
      u_grain: 0.028,
      u_speed: 0.3,
      u_colHalf: 340,
      u_feather: 96,
      u_bg: cssColor('bg'),
      u_ink: cssColor('fg'),
    }),
    [theme],
  )

  return (
    <ShaderMount
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 animate-[fade-in_1200ms_var(--ease-out)_both]"
      fragmentShader={grainShader}
      uniforms={uniforms}
      speed={reduced ? 0 : 1}
      // Render at ~1 CSS px: the wash is soft, so 2x only paid for finer grain (4x the GPU work).
      // The larger of screen and viewport, so the canvas never drops below the window it fills.
      maxPixelCount={Math.max(screen.width * screen.height, innerWidth * innerHeight)}
    />
  )
}
