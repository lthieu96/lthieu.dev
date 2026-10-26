export type Sample = { x: number; y: number; t: number }

const WINDOW_MS = 700
const MIN_TRAVEL = 1400 // px the cursor covers inside the window
const MIN_TURNS = 3 // times it doubles back, on either axis

/**
 * Whether the pointer samples (oldest first) end in a shake: a lot of travel in a short time,
 * doubling back several times. A long fast swipe travels far but never turns; a slow wiggle
 * turns but doesn't travel.
 */
export function isShake(samples: Sample[]) {
  const end = samples[samples.length - 1]
  if (!end) return false
  let travel = 0
  let turns = 0
  let dirX = 0
  let dirY = 0
  for (let i = samples.length - 1; i > 0 && end.t - samples[i - 1].t <= WINDOW_MS; i--) {
    const dx = samples[i].x - samples[i - 1].x
    const dy = samples[i].y - samples[i - 1].y
    travel += Math.hypot(dx, dy)
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
  return travel >= MIN_TRAVEL && turns >= MIN_TURNS
}
