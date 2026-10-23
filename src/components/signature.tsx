import { type CSSProperties, useEffect, useId, useRef, useState } from 'react'
import { site } from '@/data/site'
import { useReducedMotion } from '@/lib/use-media-query'

// Centre lines of "HieuLe" in Sign Style at 48px, in writing order, in the same units as the
// <text> below (baseline at y=0). Traced along the glyphs' skeleton between hand-picked points;
// redo them if the font or the name changes. Timing is ~220 units/s with a 60ms pen lift between.
const strokes = [
  // H right stem first, so the bar that closes the H runs straight on into "ieu"
  {
    d: 'M23.5,-30.2Q20.2,-26 18.1,-22.4Q16,-18.8 15,-16.5Q14,-14.2 13.5,-13.8Q13,-13.4 11.1,-8.15Q9.2,-2.9 8.75,0.2Q8.3,3.3 8.45,4.6L8.6,5.9',
    delay: 0,
    duration: 194,
  },
  // H left stem, down to the tail, back up to the fork and on into the loop and bar: one pen stroke
  {
    d: 'M11.7,-25.7Q7.1,-16.6 6.45,-14.9Q5.8,-13.2 5.45,-12.8Q5.1,-12.4 3.85,-9Q2.6,-5.6 2.35,-5.4Q2.1,-5.2 1.85,-3.5Q1.6,-1.8 0.9,0.6L0.2,3L0.9,0.6Q1.6,-1.8 1.85,-3.5Q2.1,-5.2 2.35,-5.4Q0.6,-8.3 -0.1,-8.9Q-0.8,-9.5 -1.95,-9.9Q-3.1,-10.3 -3.05,-10.6Q-3,-10.9 -0.15,-11.6Q2.7,-12.3 3.9,-12.35Q5.1,-12.4 5.4,-12.7Q5.7,-13 9.4,-13.25Q13.1,-13.5 13.45,-13.8Q13.8,-14.1 18.2,-14.25L22.6,-14.4',
    delay: 254,
    duration: 335,
  },
  // ieu
  {
    d: 'M24.8,-13.5Q23.8,-11.9 23.95,-11.3Q24.1,-10.7 24.95,-10.75Q25.8,-10.8 27.9,-11.6Q30,-12.4 30.5,-12.2Q31,-12 31.85,-12.7Q32.7,-13.4 31.35,-12.1Q30,-10.8 29.9,-10.15Q29.8,-9.5 30.05,-9.25Q30.3,-9 30.95,-9Q31.6,-9 32.95,-9.4Q34.3,-9.8 36.3,-10.9Q38.3,-12 38.75,-12Q39.2,-12 39.45,-12.45Q39.7,-12.9 39.45,-12.45Q39.2,-12 39.35,-11.75Q39.5,-11.5 40.55,-11.65Q41.6,-11.8 41.9,-12.15Q42.2,-12.5 41.9,-12.15Q41.6,-11.8 41.6,-11.15Q41.6,-10.5 41.8,-10.15Q42,-9.8 42.95,-9.95Q43.9,-10.1 46.5,-11.4L49.1,-12.7',
    delay: 649,
    duration: 215,
  },
  // i dot
  { d: 'M26.4,-16.5l0.01 0', delay: 924, duration: 90 },
  // L
  {
    d: 'M60.2,-29.2Q56.3,-23.3 55.8,-22.85Q55.3,-22.4 52.7,-17.15Q50.1,-11.9 48.15,-6.55Q46.2,-1.2 45.95,-0.1Q45.7,1 45.75,2.2Q45.8,3.4 46.3,3.85Q46.8,4.3 47.6,4.25Q48.4,4.2 55.7,0.55Q63,-3.1 64.55,-3.5Q66.1,-3.9 67.45,-3.9L68.8,-3.9',
    delay: 1074,
    duration: 299,
  },
  // e
  {
    d: 'M66.8,-13.4Q64,-10.7 63.95,-10.1Q63.9,-9.5 64.1,-9.25Q64.3,-9 66.1,-9.3Q67.9,-9.6 70.75,-11.15L73.6,-12.7',
    delay: 1433,
    duration: 90,
  },
]
const END = strokes[strokes.length - 1].delay + strokes[strokes.length - 1].duration

const glyphs = { x: 0, y: 0, fontSize: 48, children: 'HieuLe' }

type State = 'still' | 'waiting' | 'writing' | 'done'

/**
 * The footer signature, written stroke by stroke the first time it scrolls into view; hovering
 * it afterwards writes it again. Strokes are thick lines drawn under a mask of the real glyphs,
 * and the glyphs fade back in at the end, so the result is exactly the font.
 */
export function AnimatedSignature() {
  const mask = useId()
  const ref = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  // 'still' is the prerendered and reduced-motion state: just the glyphs.
  const [state, setState] = useState<State>('still')
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (reduced || !ref.current) return setState('still')
    setState('waiting')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('writing')
        io.disconnect()
      },
      { threshold: 0.6 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [reduced])

  useEffect(() => {
    if (state !== 'writing') return
    const t = setTimeout(() => setState('done'), END)
    return () => clearTimeout(t)
  }, [state])

  const replay = () => {
    if (state !== 'done') return
    setRun((r) => r + 1)
    setState('writing')
  }

  return (
    <svg
      ref={ref}
      viewBox="-6 -33 84 42"
      width={84}
      height={42}
      role="img"
      aria-label={site.name}
      // overflow-visible: if a browser sets the font a touch wider, the last letter overhangs
      // the box instead of being clipped.
      className="shrink-0 overflow-visible font-hand text-muted"
      onPointerEnter={replay}
    >
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="-20" y="-45" width="120" height="66">
          <text {...glyphs} fill="#fff" />
        </mask>
      </defs>
      {(state === 'writing' || state === 'done') && (
        <g
          key={run}
          mask={`url(#${mask})`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {strokes.map((s) => (
            <path
              key={s.d}
              d={s.d}
              pathLength={1}
              // The gap is longer than the path and the dash starts past its start, so an
              // unwritten stroke shows nothing, not even its round cap.
              strokeDasharray="1 1.1"
              style={
                {
                  animation: `sign ${s.duration}ms cubic-bezier(0.45, 0, 0.55, 1) ${s.delay}ms both`,
                } as CSSProperties
              }
            />
          ))}
        </g>
      )}
      <text
        {...glyphs}
        fill="currentColor"
        className={
          state === 'done'
            ? 'transition-opacity duration-200'
            : state === 'still'
              ? undefined
              : 'opacity-0'
        }
      />
    </svg>
  )
}
