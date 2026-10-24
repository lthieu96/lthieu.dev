// Dithered aurora: two soft light pools that drift very slowly, quantised with a Bayer 8x8
// matrix into 2px cells. A light leak in the site's own dither language.
// Panel mode (u_colHalf = 0): the pools sit top centre, behind the media, like the current
// radial gradient. Margin mode: they sit in the top corners.
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
 * @default 0.03
 * @range 0, 0.3
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
 * @label Glow strength
 * @default 0.16
 * @range 0, 0.6
 */
uniform float u_inkStrength;

/**
 * @label Cell size (px)
 * @default 2
 * @range 1, 6
 */
uniform float u_cell;

/**
 * @label Tone levels
 * @default 3
 * @range 2, 8
 */
uniform float u_levels;

/**
 * @label Pool size
 * @default 0.4
 * @range 0.2, 1.2
 */
uniform float u_size;

/**
 * @label Second tint
 * @color
 * @default #86A6C4
 */
uniform vec3 u_tint;

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

float pool(vec2 uv, vec2 c, float s) {
  vec2 d = (uv - c) / s;
  return exp(-dot(d, d));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / u_cell);
  vec2 cc = (cell + 0.5) * u_cell;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = vec2(cc.x / u_resolution.y, cc.y / u_resolution.y);
  float t = u_time * u_speed;
  bool panel = u_colHalf <= 0.0;

  float cx = 0.5 * aspect;
  vec2 a = panel ? vec2(cx - 0.18 * aspect, 1.0) : vec2(0.12 * aspect, 1.0);
  vec2 b = panel ? vec2(cx + 0.2 * aspect, 0.95) : vec2(0.9 * aspect, 0.9);
  a += 0.08 * vec2(sin(t * 2.0), cos(t * 1.3));
  b += 0.08 * vec2(cos(t * 1.7), sin(t * 2.3));
  // a little noise breaks the perfect gaussian so it reads as light, not a CSS blob
  float n = 0.75 + 0.5 * fbm(uv * 3.0 + t);
  float pa = pool(uv, a, u_size) * n;
  float pb = pool(uv, b, u_size * 0.8) * n;
  float md = length(cc - u_mouse) / 200.0;
  float lift = 0.25 * exp(-md * md);

  float mask = marginMask(cc);
  float v = clamp((pa + pb) * 0.8 + lift, 0.0, 1.0) * mask;
  float lv = u_levels - 1.0;
  float q = clamp(floor(v * lv + bayer8(cell)), 0.0, lv) / lv;
  vec3 tint = mix(u_accent, u_tint, pb / max(pa + pb, 1e-3));
  gl_FragColor = vec4(mix(u_bg, tint, q * u_inkStrength), 1.0);
}
