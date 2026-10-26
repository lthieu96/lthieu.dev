import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import loopFragment from '@/components/shaders/char-loop.frag?raw'
import loopVertex from '@/components/shaders/char-loop.vert?raw'
import fragmentShader from '@/components/shaders/char-rain.frag?raw'
import vertexShader from '@/components/shaders/char-rain.vert?raw'
import { cssColor } from '@/lib/theme'
import { useReducedMotion } from '@/lib/use-media-query'
import { isShake, type Sample } from './shake'

// Latin, digits, Vietnamese letters and code punctuation: random, but clearly from here.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ĂÂĐÊÔƠƯăâđêôơư<>/{}[]=+*#$%&@'
const CW = 14 // cell, CSS px
const CH = 18
const RAGGED = 120 // px a column's front may trail the curtain edge, so the edge looks poured
const DOWN_MS = 1500
const UP_MS = 900
const DIM = 0.05 // a character's alpha away from any light
const TRAIL = 0.7 // alpha at a drop's head; its trail fades from here
const GLOW_R = 64 // px around the cursor that lights up
const GLOW_FADE = 2.2 // per second: how fast the cursor's light fades behind it
const HALO = 22 // px across the soft light behind a glowing character
const ATLAS_COLS = 16 // glyphs per row in the atlas texture
const LOOP_COUNT = 20000 // characters in the ∞
const LOOP_SIZE = 10 // px, a character in the ∞ at middle depth
const FORM_S = 1.4 // seconds for the characters to gather into the ∞, or to go home
const HOLD_S = 4 // seconds the ∞ stays after the last shake

const rand = (n: number) => Math.floor(Math.random() * n)
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

/**
 * A full-screen curtain of random characters, drawn by char-rain.frag in one pass. `go(true)`
 * pours it down from the top, `go(false)` pulls it back up from wherever it is. While it's down,
 * drops run down the columns like rain on glass, and the characters around the cursor light up,
 * fading out behind it as it moves. Shaking the cursor sends the characters flying into a
 * swirling ∞ (char-loop.vert), and home again once it settles. `onIdle` fires once it's fully up
 * again. Null without WebGL2.
 *
 * The CPU keeps only what can't be a formula: which character is in each cell (a few change now
 * and then) and how warm the cursor left each cell. Both go up as one small texture per frame.
 */
function curtain(el: HTMLCanvasElement, onIdle: () => void) {
  const gl = el.getContext('webgl2', { antialias: false, premultipliedAlpha: true })
  return gl && rain(gl, el, onIdle)
}

function rain(gl: WebGL2RenderingContext, el: HTMLCanvasElement, onIdle: () => void) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)!)
    return sh
  }
  const link = (vs: string, fs: string) => {
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)!)
    return prog
  }
  const prog = link(vertexShader, fragmentShader)
  const loop = link(loopVertex, loopFragment)
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
  const use = (pr: WebGLProgram) => gl.useProgram(pr)
  use(prog)
  const uni = (name: string, pr = prog) => gl.getUniformLocation(pr, name)
  // Everything is premultiplied, and the ∞ draws over the wall.
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  const texture = (unit: number, filter: number) => {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  // The atlas stays on unit 0 and the per-cell state on unit 1, so each upload hits the right one.
  texture(0, gl.LINEAR)
  texture(1, gl.NEAREST)
  gl.uniform1i(uni('u_state'), 1)
  const u = {
    time: uni('u_time'),
    p: uni('u_p'),
    pouring: uni('u_pouring'),
    wallForm: uni('u_form'),
    loopTime: uni('u_time', loop),
    form: uni('u_form', loop),
    loopP: uni('u_p', loop),
  }

  let W = 0
  let H = 0
  let cols = 0
  let rows = 0
  let glyph = new Uint8Array(0)
  let heat = new Float32Array(0) // per cell, row by row, 0..1: how lit the cursor left it
  let state = new Uint8Array(0)
  const ptr = { x: 0, y: 0, on: false }
  const prev = { x: 0, y: 0, on: false } // where the cursor was last frame
  let time = 0
  let form = 0 // 0 = the characters are in the wall, 1 = they're all in the ∞
  let hold = 0 // s the ∞ has left before the characters head home
  let shakes: Sample[] = [] // the cursor's last moments, for spotting a shake
  let p = 0 // 0 = up, 1 = down
  let from = 0
  let to = 0
  let t0 = 0
  let dur = 1
  let raf = 0
  let last = 0
  let still = false

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    W = innerWidth
    H = innerHeight
    el.width = Math.round(W * dpr)
    el.height = Math.round(H * dpr)
    gl.viewport(0, 0, el.width, el.height)
    cols = Math.ceil(W / CW)
    rows = Math.ceil(H / CH)
    glyph = Uint8Array.from({ length: cols * rows }, () => rand(CHARS.length))
    heat = new Float32Array(cols * rows)
    form = 0
    hold = 0
    shakes = []
    state = new Uint8Array(cols * rows * 4)

    // Every character drawn once, white on clear, at the screen's pixel density.
    const cw = Math.ceil(CW * dpr)
    const ch = Math.ceil(CH * dpr)
    const atlas = document.createElement('canvas')
    atlas.width = ATLAS_COLS * cw
    atlas.height = Math.ceil(CHARS.length / ATLAS_COLS) * ch
    const ac = atlas.getContext('2d')!
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono')
    ac.font = `300 ${13 * dpr}px ${mono.trim() || 'monospace'}`
    ac.textBaseline = 'top'
    ac.fillStyle = '#fff'
    for (let i = 0; i < CHARS.length; i++) {
      ac.fillText(CHARS[i], (i % ATLAS_COLS) * cw + dpr, Math.floor(i / ATLAS_COLS) * ch + 2 * dpr)
    }
    gl.activeTexture(gl.TEXTURE0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    gl.activeTexture(gl.TEXTURE1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, state)

    const seed = Math.random() * 100
    for (const pr of [loop, prog]) {
      use(pr)
      gl.uniform2f(uni('u_res', pr), el.width, el.height)
      gl.uniform1f(uni('u_dpr', pr), el.width / W)
      gl.uniform2f(uni('u_cell', pr), CW, CH)
      gl.uniform2f(uni('u_grid', pr), cols, rows)
      gl.uniform1f(uni('u_seed', pr), seed)
      gl.uniform1i(uni('u_atlas', pr), 0)
      gl.uniform2f(uni('u_atlasCell', pr), cw, ch)
      gl.uniform1f(uni('u_atlasCols', pr), ATLAS_COLS)
      gl.uniform3fv(uni('u_fg', pr), cssColor('fg'))
      gl.uniform3fv(uni('u_accent', pr), cssColor('accent'))
      if (pr === loop) {
        gl.uniform1f(uni('u_size', loop), LOOP_SIZE)
        gl.uniform1f(uni('u_glyphs', loop), CHARS.length)
      }
    }
    // Uniforms set from here on are the wall's: its program is the one in use.
    gl.uniform1f(uni('u_ragged'), RAGGED)
    gl.uniform1f(uni('u_dim'), DIM)
    gl.uniform1f(uni('u_trail'), TRAIL)
    gl.uniform1f(uni('u_halo'), HALO)
    gl.uniform3fv(uni('u_bg'), cssColor('bg'))
  }

  function warm(x: number, y: number) {
    const c1 = Math.min(cols - 1, Math.floor((x + GLOW_R) / CW))
    const r1 = Math.min(rows - 1, Math.floor((y + GLOW_R) / CH))
    for (let r = Math.max(0, Math.floor((y - GLOW_R) / CH)); r <= r1; r++) {
      for (let c = Math.max(0, Math.floor((x - GLOW_R) / CW)); c <= c1; c++) {
        const d = Math.hypot(c * CW + CW / 2 - x, r * CH + CH / 2 - y)
        if (d < GLOW_R) heat[r * cols + c] = Math.max(heat[r * cols + c], (1 - d / GLOW_R) ** 2)
      }
    }
  }

  function draw(dt: number) {
    time += dt
    // A few characters change now and then, so the wall never sits quite still.
    for (let i = 0; i < glyph.length * 0.002; i++) glyph[rand(glyph.length)] = rand(CHARS.length)
    // Reduced motion: the light follows the cursor but doesn't linger.
    const keep = still ? 0 : Math.exp(-GLOW_FADE * dt)
    for (let i = 0; i < heat.length; i++) heat[i] *= keep
    // A fast cursor jumps a long way between frames, so warm the whole path it took, not only
    // where it is now; otherwise a quick sweep leaves a dotted trail.
    if (ptr.on) {
      const dx = prev.on ? ptr.x - prev.x : 0
      const dy = prev.on ? ptr.y - prev.y : 0
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8))
      for (let i = 1; i <= steps; i++)
        warm(ptr.x - dx * (1 - i / steps), ptr.y - dy * (1 - i / steps))
    }
    Object.assign(prev, ptr)
    for (let i = 0; i < glyph.length; i++) {
      state[i * 4] = glyph[i]
      state[i * 4 + 1] = heat[i] * 255
    }
    gl.activeTexture(gl.TEXTURE1)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, state)
    gl.uniform1f(u.time, time)
    gl.uniform1f(u.p, p)
    gl.uniform1f(u.pouring, to === 1 && p < 1 ? 1 : 0)
    gl.uniform1f(u.wallForm, form)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    hold = Math.max(0, hold - dt)
    form = Math.min(1, Math.max(0, form + ((hold > 0 ? 1 : -1) * dt) / FORM_S))
    if (form > 0) {
      use(loop)
      gl.uniform1f(u.loopTime, time)
      gl.uniform1f(u.form, form)
      gl.uniform1f(u.loopP, p)
      gl.drawArrays(gl.POINTS, 0, LOOP_COUNT)
      use(prog)
    }
  }

  const clear = () => {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const k = Math.min(1, (now - t0) / dur)
    p = from + (to - from) * ease(k)
    draw(dt)
    if (k >= 1 && to === 0) {
      raf = 0
      clear()
      onIdle()
      return
    }
    raf = requestAnimationFrame(frame)
  }

  const onResize = () => {
    if (p === 0) return
    size()
    if (still) draw(0)
  }
  addEventListener('resize', onResize)
  const onMove = (e: PointerEvent) => {
    Object.assign(ptr, { x: e.clientX, y: e.clientY, on: true })
    if (!still) {
      shakes.push({ x: e.clientX, y: e.clientY, t: e.timeStamp })
      while (e.timeStamp - shakes[0].t > 2500) shakes.shift()
      // Shaking on keeps the ∞ up; it lingers HOLD_S after the last shake.
      if (isShake(shakes)) hold = HOLD_S
    }
    if (still && p === 1) draw(0)
  }
  const onLeave = () => {
    ptr.on = false
    if (still && p === 1) draw(0)
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  return {
    go(down: boolean, reduced: boolean) {
      // Fresh colours, sizes and characters each time it comes down from fully up.
      if (down && p === 0) size()
      still = reduced
      if (reduced) {
        // No pouring and no rain: the wall is simply there, or simply gone.
        cancelAnimationFrame(raf)
        raf = 0
        p = to = down ? 1 : 0
        if (down) draw(0)
        else {
          clear()
          onIdle()
        }
        return
      }
      from = p
      to = down ? 1 : 0
      if (!down) hold = 0 // the characters head home as the curtain lifts
      // A partial trip takes its share of the time, so lifting halfway is quick.
      dur = (down ? DOWN_MS : UP_MS) * Math.max(0.35, Math.abs(to - from))
      t0 = performance.now()
      if (!raf) {
        last = t0
        raf = requestAnimationFrame(frame)
      }
    },
    stop() {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    },
  }
}

/**
 * The avatar. Clicking it pours a curtain of random characters down over the whole page; a click
 * anywhere on the curtain (or Esc, or the avatar again) lifts it back up, even mid-pour.
 */
export function Avatar() {
  const [down, setDown] = useState(false)
  const [shown, setShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const ctl = useRef<ReturnType<typeof curtain> | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mounted || !canvas.current) return
    const c = curtain(canvas.current, () => setShown(false))
    ctl.current = c
    return () => c?.stop()
  }, [mounted])

  const go = (next: boolean) => {
    // Without WebGL2 the avatar is just a picture.
    if (!ctl.current) return
    setDown(next)
    if (next) setShown(true)
    ctl.current?.go(next, reduced)
  }

  useEffect(() => {
    if (!down) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && go(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <button
        type="button"
        aria-label="Make it rain"
        aria-pressed={down}
        onClick={() => go(!down)}
        className="block flex-none cursor-pointer rounded-full transition-[scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 active:scale-92"
      >
        <img
          src="/img/avatar.webp"
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover outline outline-1 outline-edge -outline-offset-1"
        />
      </button>
      {/* In <body>, so no transformed ancestor (the intro's entrance) can trap the fixed canvas. */}
      {mounted &&
        createPortal(
          <canvas
            ref={canvas}
            aria-hidden
            onClick={() => go(false)}
            className={`fixed inset-0 z-50 size-full ${shown ? 'cursor-pointer' : 'pointer-events-none invisible'}`}
          />,
          document.body,
        )}
    </>
  )
}
