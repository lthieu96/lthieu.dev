import { useEffect, useRef } from 'react'
import type { SimpleIcon } from 'simple-icons'
import { useAfterPaint } from '@/lib/after-paint'
import { cssColor, type Theme, useTheme } from '@/lib/theme'
import { useReducedMotion } from '@/lib/use-media-query'
import fragmentShader from './particle-logo.frag?raw'
import vertexShader from './particle-logo.vert?raw'

export type Logo = {
  /** Only the outline and brand colour are used, so logos outside Simple Icons can be passed in too. */
  icon: Pick<SimpleIcon, 'path' | 'hex'>
  /** A stroke of the same fill, in the icon's 24-unit viewBox, so outline logos don't break up. */
  weight?: number
}

type Props = {
  /** Every logo the tile can show. Must be stable: a new array remounts the canvas. */
  logos: Logo[]
  /** Index into `logos`, or null to cycle through them at random. */
  shown: number | null
  /** Let touch scatter the particles too (mouse and pen always can). */
  touch: boolean
  /** Sampling grid across the tile, i.e. the density. 140 is about 1.15 CSS px per particle on the 160px tile. */
  grid?: number
  /** How far the pointer scatters particles, in CSS px of the tile. */
  repelRadius?: number
  /** How hard a click or tap bursts the logo apart (outward speed); 0 turns it off. */
  burst?: number
  /** Called with the particle count of the logo on screen whenever it changes. */
  onCount?: (count: number) => void
  className?: string
}

const MAX = 16000 // particles; bigger logos are subsampled evenly
const LAYERS = 6
const THICK = 0.22 // slab depth, in a tile 2 units wide
const SCALE = 0.78 // leaves room for the tilt and the shadow
const K = 90 // spring stiffness
const C = 14 // damping (ratio ~0.74: a little overshoot)
const F = 160 // pointer repel strength
const IDLE_MS = 3000
const LIVELY_MS = IDLE_MS + 2000 // how long the sway keeps going after anything happens

// WCAG relative luminance and contrast, for brand colours that would vanish on the page.
const lum = (c: number[]) =>
  c
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0)
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** The brand hex, or mixed toward black/white just enough to reach 3:1 on `bg`. */
function brand(hex: string, bg: number[], light: boolean) {
  const c = [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
  const to = light ? 0 : 1
  let out = c
  for (let t = 0.02; t <= 1 && contrast(out, bg) < 3; t += 0.02)
    out = c.map((v) => v + (to - v) * t)
  return out
}

/**
 * The cells of a g×g grid the logo covers, as x, y pairs in -1..1. Sampling every logo on the
 * same grid keeps the particle density even; sorting by angle means particle i lands at a
 * similar angle in every logo, so morphs travel locally.
 */
function sample(logo: Logo, g: number) {
  // Cached per logo and grid: coming back to the page would otherwise rasterise every logo again,
  // ~35ms, right in the page transition.
  const byGrid = samples.get(logo) ?? new Map<number, [number, number, number][]>()
  samples.set(logo, byGrid)
  const hit = byGrid.get(g)
  if (hit) return hit
  const cells = rasterise(logo, g)
  byGrid.set(g, cells)
  return cells
}
const samples = new WeakMap<Logo, Map<number, [number, number, number][]>>()

function rasterise({ icon, weight }: Logo, g: number) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = g
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  const s = g / 28 // viewBox -2 -2 28 28
  ctx.setTransform(s, 0, 0, s, 2 * s, 2 * s)
  const path = new Path2D(icon.path)
  ctx.fill(path)
  if (weight) {
    ctx.lineWidth = weight
    ctx.lineJoin = 'round'
    ctx.stroke(path)
  }
  const d = ctx.getImageData(0, 0, g, g).data
  const cells: [number, number, number][] = []
  for (let j = 0; j < g; j++)
    for (let i = 0; i < g; i++) {
      if (d[(j * g + i) * 4 + 3] < 100) continue
      const x = ((i + 0.5) / g) * 2 - 1
      const y = 1 - ((j + 0.5) / g) * 2
      cells.push([x, y, Math.atan2(y, x)])
    }
  cells.sort((a, b) => a[2] - b[2])
  return cells
}

function createTile(canvas: HTMLCanvasElement, logos: Logo[]) {
  const gl = canvas.getContext('webgl2', { antialias: false })
  return gl && tile(gl, canvas, logos)
}

function tile(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, logos: Logo[]) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)!)
    return sh
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertexShader))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragmentShader))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)!)
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
  gl.useProgram(prog)
  gl.enable(gl.DEPTH_TEST)
  const uni = (name: string) => gl.getUniformLocation(prog, name)
  const u = {
    res: uni('u_res'),
    cell: uni('u_cell'),
    rot: uni('u_rot'),
    shade: uni('u_shade'),
    shadow: uni('u_shadow'),
  }
  gl.uniform1f(uni('u_layers'), LAYERS)
  gl.uniform1f(uni('u_step'), THICK / LAYERS)
  gl.uniform1f(uni('u_scale'), SCALE)

  // Everything sized by the particle count is (re)built by setGrid, before anything is shown.
  let grid = 0
  let homes: [number, number, number][][] = []
  let n = 0
  // Spare particles on smaller logos share cells, spread evenly over the shape.
  const homeOf = (logo: number, i: number) => homes[logo][Math.floor((i * homes[logo].length) / n)]

  // Only the front layer is simulated; the other layers and the shadow follow it in the shader.
  let pos = new Float32Array(0)
  let vel = new Float32Array(0)
  let col = new Float32Array(0)
  let home = new Float32Array(0)
  let next = new Float32Array(0)
  let release = new Float64Array(0) // when each particle leaves for `next`; 0 = not pending
  let stiff = new Float32Array(0)
  let target = new Uint8Array(0) // logo whose colour each particle is heading for
  let nextTarget = new Uint8Array(0)

  const attribute = (name: string) => {
    const b = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    const loc = gl.getAttribLocation(prog, name)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0)
    return b
  }
  const posBuf = attribute('a_pos')
  const colBuf = attribute('a_col')
  const upload = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos)
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, col)
  }

  /** Resample every logo and resize the particle arrays, carrying the old particles over. */
  function resample(g: number) {
    grid = g
    homes = logos.map((l) => sample(l, g))
    const old = { n, pos, col }
    n = Math.min(MAX, Math.max(...homes.map((h) => h.length)))
    pos = new Float32Array(n * 3)
    vel = new Float32Array(n * 3)
    col = new Float32Array(n * 3)
    home = new Float32Array(n * 3)
    next = new Float32Array(n * 3)
    release = new Float64Array(n)
    stiff = new Float32Array(n)
    target = new Uint8Array(n).fill(Math.max(0, current))
    nextTarget = new Uint8Array(n)
    pending = 0
    for (let i = 0; i < n; i++) {
      const o = i * 3
      if (old.n) {
        // Both orders are by angle, so the nearest old particle is at the same fraction.
        const j = Math.floor((i * old.n) / n) * 3
        pos.set(old.pos.subarray(j, j + 3), o)
        col.set(old.col.subarray(j, j + 3), o)
      } else {
        // Start as a loose sphere so the first logo assembles.
        const a = Math.random() * 6.283
        const z = Math.random() * 2 - 1
        const r = 1.3 * Math.sqrt(1 - z * z)
        pos.set([r * Math.cos(a), r * Math.sin(a), z * 1.3], o)
      }
      home.set(pos.subarray(o, o + 3), o)
      // Varied stiffness, so the swarm arrives unevenly.
      stiff[i] = K * (0.7 + Math.random() * 0.6)
    }
    for (const b of [posBuf, colBuf]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, n * 12, gl.DYNAMIC_DRAW)
    }
    upload()
  }

  let reach = 0.32 // repel radius in model units; set from CSS px by setRepel
  let reachPx = 20
  let burst = 5
  let palette: number[][] = logos.map(() => [0, 0, 0])
  let shade = [0.45, 1, 0]
  let shadow = [0, 0, 0, 0]
  let reduced = false
  let touch = false
  let shown: number | null = null
  let current = -1
  let pending = 0
  let onCount: (count: number) => void = () => {}
  let visible = false
  let changedAt = 0
  let livelyUntil = 0
  const ptr = { x: 0, y: 0, on: false, strength: 0 }
  // Rotation (x, y), its velocity, and how much idle sway is mixed in.
  const rot = { x: 0, y: 0, vx: 0, vy: 0, sway: 0 }
  let awake = false // physics still moving
  let raf = 0
  let last = 0

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(canvas.clientWidth * dpr)
    canvas.height = Math.round(canvas.clientHeight * dpr)
    // A model unit is SCALE half-tiles on screen.
    reach = reachPx / ((SCALE * canvas.clientWidth) / 2 || 1)
  }

  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniform2f(u.res, canvas.width, canvas.height)
    gl.uniform1f(u.cell, canvas.width / grid)
    gl.uniform2f(u.rot, rot.x, rot.y)
    gl.uniform3fv(u.shade, shade)
    gl.uniform4fv(u.shadow, shadow)
    gl.drawArraysInstanced(gl.POINTS, 0, n, LAYERS + 1)
  }

  // Slow sway while lively, blended into a tilt toward the pointer. Returns whether it's moving.
  function turn(dt: number, now: number) {
    rot.sway += ((now < livelyUntil ? 1 : 0) - rot.sway) * Math.min(1, dt * 1.5)
    const t = now / 1000
    const p = ptr.strength
    const ty = 0.38 * Math.sin(t * 0.55) * rot.sway * (1 - p) + ptr.x * 0.55 * p
    const tx = (0.12 + 0.1 * Math.sin(t * 0.37)) * rot.sway * (1 - p) - ptr.y * 0.4 * p
    rot.vy += ((ty - rot.y) * 40 - rot.vy * 9) * dt
    rot.y += rot.vy * dt
    rot.vx += ((tx - rot.x) * 40 - rot.vx * 9) * dt
    rot.x += rot.vx * dt
    return rot.sway > 1e-3 || Math.abs(rot.vy) + Math.abs(rot.vx) + Math.abs(ty - rot.y) > 1e-4
  }

  function step(dt: number, now: number) {
    ptr.strength += ((ptr.on ? 1 : 0) - ptr.strength) * Math.min(1, dt * 10)
    const p = ptr.strength
    const blend = Math.min(1, dt * 6)
    let e = 0
    for (let i = 0, o = 0; i < n; i++, o += 3) {
      if (release[i] && now >= release[i]) {
        home.set(next.subarray(o, o + 3), o)
        target[i] = nextTarget[i]
        release[i] = 0
        pending--
        vel[o + 2] += 1.5 + Math.random() * 2 // arc toward the camera on the way over
      }
      const k = stiff[i]
      let ax = (home[o] - pos[o]) * k - vel[o] * C
      let ay = (home[o + 1] - pos[o + 1]) * k - vel[o + 1] * C
      let az = (home[o + 2] - pos[o + 2]) * k - vel[o + 2] * C
      if (p > 1e-3) {
        const dx = pos[o] - ptr.x
        const dy = pos[o + 1] - ptr.y
        const d2 = dx * dx + dy * dy
        if (d2 < reach * reach) {
          const d = Math.sqrt(d2) + 1e-4
          const f = (p * F * (1 - d / reach) ** 2) / d
          ax += dx * f
          ay += dy * f
          az += f * d * 0.6
        }
      }
      vel[o] += ax * dt
      vel[o + 1] += ay * dt
      vel[o + 2] += az * dt
      pos[o] += vel[o] * dt
      pos[o + 1] += vel[o + 1] * dt
      pos[o + 2] += vel[o + 2] * dt
      // Colour eases to the new brand colour once the particle has left: it changes in flight.
      const c = palette[target[i]]
      const dr = c[0] - col[o]
      const dg = c[1] - col[o + 1]
      const db = c[2] - col[o + 2]
      col[o] += dr * blend
      col[o + 1] += dg * blend
      col[o + 2] += db * blend
      e = Math.max(
        e,
        Math.abs(vel[o]) + Math.abs(vel[o + 1]) + Math.abs(vel[o + 2]),
        Math.abs(home[o] - pos[o]) + Math.abs(home[o + 1] - pos[o + 1]),
        Math.abs(dr) + Math.abs(dg) + Math.abs(db),
      )
    }
    return e > 2e-3 || pending > 0 || p > 1e-3
  }

  function frame(now: number) {
    raf = 0
    const dt = Math.min(1 / 30, (now - last) / 1000)
    last = now
    const turning = turn(dt, now)
    if (awake) {
      // Two substeps keep the stiff springs stable at 30fps.
      const a = step(dt / 2, now)
      awake = step(dt / 2, now) || a
      upload()
    }
    draw()
    if ((awake || turning) && visible && !document.hidden) raf = requestAnimationFrame(frame)
  }

  /** Reduced motion: a still, slightly turned slab, so the depth still reads. */
  function still() {
    for (let i = 0; i < n; i++) col.set(palette[target[i]], i * 3)
    rot.x = 0.15
    rot.y = 0.35
    upload()
    draw()
  }

  function wake() {
    if (reduced) return still()
    awake = true
    if (!raf && visible && !document.hidden) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }

  function show(logo: number) {
    const now = performance.now()
    current = logo
    changedAt = now
    onCount(Math.min(homes[logo].length, n))
    livelyUntil = now + LIVELY_MS
    for (let i = 0; i < n; i++) {
      const [x, y] = homeOf(logo, i)
      const o = i * 3
      if (reduced) {
        pos.set([x, y, 0], o)
        home.set([x, y, 0], o)
        vel.fill(0, o, o + 3)
        target[i] = logo
        if (release[i]) pending--
        release[i] = 0
        continue
      }
      next.set([x, y, 0], o)
      nextTarget[i] = logo
      if (!release[i]) pending++
      release[i] = now + ((x + 1) / 2) * 220 + Math.random() * 80 // left-to-right sweep
    }
    if (!reduced) rot.vy += 2.5 // a swing on every morph shows the depth
    wake()
  }

  const random = () => {
    const i = Math.floor(Math.random() * (logos.length - 1))
    return i >= current ? i + 1 : i // never the one already up
  }

  const idle = setInterval(() => {
    const now = performance.now()
    if (shown !== null || reduced || !visible || document.hidden || ptr.on) return
    if (now - changedAt < IDLE_MS) return
    show(random())
  }, 250)

  const toModel = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect()
    // shortcut: ignores the tilt when mapping the pointer; fine at these angles.
    ptr.x = (((e.clientX - r.left) / r.width) * 2 - 1) / SCALE
    ptr.y = (1 - ((e.clientY - r.top) / r.height) * 2) / SCALE
  }
  const onMove = (e: PointerEvent) => {
    if (reduced || (e.pointerType === 'touch' && !touch)) return
    toModel(e)
    ptr.on = true
    livelyUntil = performance.now() + LIVELY_MS
    wake()
  }
  const onLeave = () => {
    ptr.on = false
    wake()
  }
  const onUp = (e: PointerEvent) => e.pointerType === 'touch' && onLeave()
  // A click throws every particle outward from the click, nearest hardest; the springs bring
  // them home. A tap does it too: it doesn't block scrolling.
  const onClick = (e: MouseEvent) => {
    if (reduced || !burst) return
    toModel(e)
    for (let i = 0, o = 0; i < n; i++, o += 3) {
      const dx = pos[o] - ptr.x
      const dy = pos[o + 1] - ptr.y
      const d = Math.hypot(dx, dy) + 0.05
      const s = (burst * (0.5 + Math.random())) / (0.4 + d)
      vel[o] += (dx / d) * s
      vel[o + 1] += (dy / d) * s
      vel[o + 2] += s * 0.8 * Math.random()
    }
    rot.vy += (Math.random() - 0.5) * 4
    livelyUntil = performance.now() + LIVELY_MS
    wake()
  }
  canvas.addEventListener('click', onClick)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerdown', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointercancel', onLeave)
  canvas.addEventListener('pointerup', onUp)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!visible) return
    livelyUntil = performance.now() + LIVELY_MS
    wake()
  })
  io.observe(canvas)
  const ro = new ResizeObserver(() => {
    resize()
    draw()
    wake()
  })
  ro.observe(canvas)
  // Coming back to the tab (or to the page from the back/forward cache): with nothing picked,
  // the next logo flies in right away.
  const onReturn = () => {
    if (document.hidden) return
    changedAt = 0
    livelyUntil = performance.now() + LIVELY_MS
    wake()
  }
  document.addEventListener('visibilitychange', onReturn)
  window.addEventListener('pageshow', onReturn)

  return {
    setGrid(g: number) {
      if (g === grid) return
      resample(g)
      if (current >= 0) show(current)
    },
    setBurst(speed: number) {
      burst = speed
    },
    setRepel(px: number) {
      reachPx = px
      resize()
    },
    setOnCount(fn: (count: number) => void) {
      onCount = fn
      if (current >= 0) fn(Math.min(homes[current].length, n))
    },
    setTheme(theme: Theme) {
      const bg = cssColor('bg')
      const light = theme === 'light'
      palette = logos.map((l) => brand(l.icon.hex, bg, light))
      shade = light ? [0.45, 1, 0.25] : [0.45, 1, 0.3]
      // A faint, sparse dither: grey on paper, black on the dark page. Enough to lift the slab
      // without a black smudge under it.
      shadow = light ? [...cssColor('subtle'), 0.1] : [0, 0, 0, 0.3]
      wake()
    },
    setReduced(value: boolean) {
      reduced = value
      if (value) {
        cancelAnimationFrame(raf)
        raf = 0
        if (current >= 0) show(current)
      } else wake()
    },
    setTouch(value: boolean) {
      touch = value
      if (!value) onLeave()
    },
    setShown(logo: number | null) {
      shown = logo
      if (logo !== null && logo !== current) show(logo)
      else if (current < 0) show(Math.floor(Math.random() * logos.length))
    },
    destroy() {
      clearInterval(idle)
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onReturn)
      window.removeEventListener('pageshow', onReturn)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointercancel', onLeave)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('click', onClick)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

/**
 * Logos as a dithered, extruded slab of particles in their brand colours. Changing `shown` flies
 * the particles into the next logo; the pointer scatters them, a click bursts them, and they
 * spring back. With nothing
 * shown it cycles at random while on screen. Reduced motion gets a still logo and instant swaps.
 */
function Tile({
  logos,
  shown,
  touch,
  grid = 140,
  repelRadius = 20,
  burst = 5,
  onCount,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const tile = useRef<ReturnType<typeof createTile>>(null)
  const theme = useTheme()
  const reduced = useReducedMotion()

  // The canvas is made here rather than rendered, so a remount (Strict Mode) gets a fresh
  // WebGL context instead of the one the cleanup just lost.
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.className = 'block size-full'
    ref.current!.append(canvas)
    tile.current = createTile(canvas, logos)
    return () => {
      tile.current?.destroy()
      tile.current = null
      canvas.remove()
    }
  }, [logos])
  // Declared in this order so the colours exist before the first logo is shown.
  useEffect(() => tile.current?.setTheme(theme), [theme])
  useEffect(() => tile.current?.setGrid(grid), [grid])
  useEffect(() => tile.current?.setRepel(repelRadius), [repelRadius])
  useEffect(() => tile.current?.setBurst(burst), [burst])
  useEffect(() => tile.current?.setOnCount(onCount ?? (() => {})), [onCount])
  useEffect(() => tile.current?.setReduced(reduced), [reduced])
  useEffect(() => tile.current?.setTouch(touch), [touch])
  useEffect(() => tile.current?.setShown(shown), [shown])

  return <div ref={ref} aria-hidden className={className} />
}

/**
 * The tile is created the frame after the page first paints: building its WebGL context and
 * sampling the logos inside a page transition would hold the transition back.
 */
export function ParticleLogo(props: Props) {
  const ready = useAfterPaint()
  return ready ? <Tile {...props} /> : <div aria-hidden className={props.className} />
}
