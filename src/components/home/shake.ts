export type Sample = { x: number; y: number; t: number }

const WINDOW_MS = 2000
const MIN_SPAN_MS = 1600 // the shaking must have kept going this long inside the window
const MIN_TRAVEL = 4500 // px the cursor covers inside the window
const MIN_TURNS = 10 // times it doubles back, on either axis
const MAX_GAP_MS = 200 // a pause longer than this ends the shake

/**
 * Whether the pointer samples (oldest first) end in a sustained shake: a lot of travel, doubling
 * back many times, kept up for most of the window. A long fast swipe travels far but never turns;
 * a slow wiggle turns but doesn't travel; a short burst stops too soon.
 */
export function isShake(samples: Sample[]) {
  const end = samples[samples.length - 1]
  if (!end) return false
  let travel = 0
  let turns = 0
  let dirX = 0
  let dirY = 0
  let start = end.t
  for (let i = samples.length - 1; i > 0 && end.t - samples[i - 1].t <= WINDOW_MS; i--) {
    if (samples[i].t - samples[i - 1].t > MAX_GAP_MS) break
    const dx = samples[i].x - samples[i - 1].x
    const dy = samples[i].y - samples[i - 1].y
    travel += Math.hypot(dx, dy)
    start = samples[i - 1].t
    // Count a turn only on a real stroke, not on a pixel of jitter.
    if (Math.abs(dx) > 12) {
      if (dirX && Math.sign(dx) !== dirX) turns++
      dirX = Math.sign(dx)
    }
    if (Math.abs(dy) > 12) {
      if (dirY && Math.sign(dy) !== dirY) turns++
      dirY = Math.sign(dy)
    }
  }
  return end.t - start >= MIN_SPAN_MS && travel >= MIN_TRAVEL && turns >= MIN_TURNS
}
