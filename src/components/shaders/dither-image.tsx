import { type PaperShaderElement, ShaderMount } from '@paper-design/shaders-react'
import { useEffect, useMemo, useRef } from 'react'
import type { DitherTone } from '@/data/projects'
import { useTheme } from '@/lib/theme'
import { useReducedMotion } from '@/lib/use-media-query'
import fragmentShader from './dither-image.frag?raw'

const REVEAL_MS = 300
// Ease in-out, not ease-out: with ease-out the hard wipe edge jumped ~20px in its first frames
// and the reveal read as a jolt. This one starts and ends softly, like a hand sweeping across.
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

type Props = DitherTone & {
  src: string
  alt: string
  /** Wipe from dither to full colour. */
  revealed: boolean
  className?: string
}

/** An image shown as a 4-tone dither that resolves into colour when `revealed`. */
export function DitherImage({
  src,
  alt,
  revealed,
  invert,
  contrast = 1.1,
  gamma = 0.6,
  className,
}: Props) {
  const ref = useRef<PaperShaderElement>(null)
  const progress = useRef(0)
  const reduced = useReducedMotion()
  const light = useTheme() === 'light'

  // Duotone per theme: dark ink on paper in light mode, pale blue on near-black in dark mode.
  // `invert` is written for the dark theme; light mode flips it so screenshots keep their polarity.
  const uniforms = useMemo(
    () => ({
      u_image: src,
      // Must be present at mount for the uniform to be registered; tweened below, not via props.
      u_reveal: 0,
      u_cell: 1,
      u_levels: 4,
      u_contrast: contrast,
      u_gamma: gamma,
      u_invert: Boolean(invert) !== light ? 1 : 0,
      u_shadow: light ? [0.227, 0.29, 0.345] : [0.082, 0.082, 0.082],
      u_light: light ? [0.925, 0.922, 0.91] : [0.663, 0.737, 0.796],
    }),
    [src, contrast, gamma, invert, light],
  )

  // u_reveal is tweened on the mount directly so React never re-renders mid-animation.
  useEffect(() => {
    const target = revealed ? 1 : 0
    const set = (v: number) => {
      progress.current = v
      ref.current?.paperShaderMount?.setUniforms({ u_reveal: v })
    }
    if (reduced) return set(target)
    const from = progress.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / REVEAL_MS)
      set(from + (target - from) * easeInOut(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [revealed, reduced])

  return (
    <ShaderMount
      ref={ref}
      role="img"
      aria-label={alt}
      className={className}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  )
}
