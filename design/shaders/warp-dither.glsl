// Warp dither: the "warp" shape from Paper Shaders Dithering (iterated cosine domain warp with a
// sin ridge) dithered with Bayer 8x8 into 1px cells, margin-only. Faster than the rest.
precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Column half-width (px, 0 = full panel)
 * @default 300
 * @range 0, 600
 */
uniform float u_colHalf;

/**
 * @label Column feather (px)
 * @default 72
 * @range 0, 300
 */
uniform float u_feather;

/**
 * @label Speed
 * @default 0.3
 * @range 0, 2
 */
uniform float u_speed;

/**
 * @label Background
 * @color
 * @default #FCFCFB
 */
uniform vec3 u_bg;

/**
 * @label Ink
 * @color
 * @default #1A1A1A
 */
uniform vec3 u_ink;

/**
 * @label Accent
 * @color
 * @default #2F6FB0
 */
uniform vec3 u_accent;


/**
 * @label Ink
 * @default 0.05
 * @range 0, 1
 */
uniform float u_inkStrength;

/**
 * @label Cell size (px)
 * @default 1
 * @range 1, 8
 */
uniform float u_cell;

/**
 * @label Peak density
 * @default 0.7
 * @range 0.1, 1
 */
uniform float u_peak;

/**
 * @label Pattern scale (px)
 * @default 333
 * @range 80, 1500
 */
uniform float u_scale;

/**
 * @label Accent amount
 * @default 0.35
 * @range 0, 1
 */
uniform float u_accentAmount;

/**
 * @label Pointer radius (px)
 * @default 160
 * @range 0, 400
 */
uniform float u_hover;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// margin-only: 0 behind the content column, feathered at its edges; fades toward the bottom.
// u_colHalf = 0 is panel mode (media backdrop): the whole frame is live.
float marginMask(vec2 frag) {
  if (u_colHalf <= 0.0) return 1.0;
  float dx = abs(frag.x - 0.5 * u_resolution.x) - u_colHalf;
  return smoothstep(0.0, u_feather, dx) * smoothstep(0.0, 0.35, frag.y / u_resolution.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor((frag - 0.5 * u_resolution) / u_cell);
  vec2 cc = (cell + 0.5) * u_cell + 0.5 * u_resolution;   // cell centre, screen px
  float t = 0.5 * u_time * u_speed;

  // Paper Shaders "warp" shape (dithering.js): iterated cosine domain warp, then a sin ridge
  // u_scale 333 = Paper's 0.003 per px at scale 1
  vec2 p = (cc - 0.5 * u_resolution) / u_scale;
  for (float i = 1.0; i < 6.0; i++) {
    p.x += 0.6 / i * cos(i * 2.5 * p.y + t);
    p.y += 0.6 / i * cos(i * 1.5 * p.x + t);
  }
  float shape = smoothstep(0.02, 1.4, 0.15 / max(0.001, abs(sin(t - p.y - p.x))));

  float md = length(cc - u_mouse) / max(u_hover, 1.0);
  float near = exp(-md * md);
  // peak below 1: even the ridge cores stay dithered, never a flat solid patch
  shape = clamp(shape * u_peak + 0.3 * near, 0.0, 1.0) * marginMask(cc);

  // Bayer 8x8 (64 levels) for smoother ramps than the reference 4x4; >= against (1 - b) keeps zero-shape cells off
  float on = step(1.0 - bayer8(cell), shape);
  vec3 ink = mix(u_ink, u_accent, u_accentAmount * shape);
  gl_FragColor = vec4(mix(u_bg, ink, on * u_inkStrength), 1.0);
}
