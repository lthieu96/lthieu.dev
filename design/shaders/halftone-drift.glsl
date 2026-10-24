// Halftone drift: a 45 degree print-style halftone of slow noise. Dot size carries the tone,
// so the margin feather becomes dots shrinking to nothing toward the column.
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
 * @label Ink
 * @default 0.14
 * @range 0, 0.6
 */
uniform float u_inkStrength;

/**
 * @label Pitch (px)
 * @default 6
 * @range 3, 24
 */
uniform float u_pitch;

/**
 * @label Coverage
 * @default 0.5
 * @range 0, 1
 */
uniform float u_density;

/**
 * @label Accent amount
 * @default 0
 * @range 0, 1
 */
uniform float u_accentAmount;

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
  mat2 rot = mat2(0.7071, -0.7071, 0.7071, 0.7071);
  vec2 g = rot * frag;
  vec2 cell = floor(g / u_pitch);
  vec2 cg = (cell + 0.5) * u_pitch;
  vec2 c = cg * rot;                                     // cell centre back in screen space
  float t = u_time * u_speed;

  vec2 p = c / 1000.0;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, -t)));
  // tone comes in clouds: open paper between them, so the field never reads as a flat screen
  float v = smoothstep(0.42, 0.72, fbm(p * 1.6 + 1.6 * q)) * u_density;
  float md = length(c - u_mouse) / 180.0;
  v = clamp(v + 0.35 * exp(-md * md), 0.0, 1.0) * marginMask(c);

  float r = 0.5 * u_pitch * sqrt(v) * 0.9;
  float dotA = 1.0 - smoothstep(r - 0.6, r + 0.6, length(g - cg));
  vec3 ink = mix(u_ink, u_accent, u_accentAmount * v);
  gl_FragColor = vec4(mix(u_bg, ink, dotA * u_inkStrength), 1.0);
}
