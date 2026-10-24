// Grain wash: a near-flat tonal wash (a few % of ink) with 1px static film grain.
// Reads as paper under soft light. Cheapest candidate: one 4-octave fbm per pixel.
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
 * @label Wash strength
 * @default 0.08
 * @range 0, 0.4
 */
uniform float u_inkStrength;

/**
 * @label Grain
 * @default 0.05
 * @range 0, 0.2
 */
uniform float u_grain;

/**
 * @label Accent glow
 * @default 0.35
 * @range 0, 1
 */
uniform float u_accentAmount;

/**
 * @label Noise scale (px)
 * @default 900
 * @range 200, 2000
 */
uniform float u_scale;

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
  vec2 p = frag / u_scale;
  float t = u_time * u_speed;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(3.1, -t)));
  float v = smoothstep(0.3, 0.8, fbm(p * 1.4 + 1.8 * q));
  float mask = marginMask(frag);

  // the pointer adds a little light, like a lamp passing over paper
  float md = length(frag - u_mouse) / 220.0;
  v = clamp(v + 0.25 * exp(-md * md), 0.0, 1.0);

  // accent glow sits in the top corners, away from the text
  vec2 uv = frag / u_resolution;
  float glow = exp(-6.0 * dot(uv - vec2(0.92, 1.0), uv - vec2(0.92, 1.0)));

  vec3 col = mix(u_bg, u_ink, v * u_inkStrength * mask);
  col = mix(col, u_accent, glow * u_accentAmount * 0.18 * mask);
  // static grain (no time term): animated grain shimmers and reads as noise
  col += (hash(floor(frag)) - 0.5) * u_grain * mask;
  gl_FragColor = vec4(col, 1.0);
}
