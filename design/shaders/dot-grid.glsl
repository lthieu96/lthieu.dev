// Dot grid: a fixed 1.5px dot lattice (blueprint paper). A slow noise field breathes
// dot opacity; dots near the pointer grow a little and pick up the accent.
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
 * @label Dot ink
 * @default 0.16
 * @range 0, 0.6
 */
uniform float u_inkStrength;

/**
 * @label Grid pitch (px)
 * @default 16
 * @range 6, 48
 */
uniform float u_pitch;

/**
 * @label Dot radius (px)
 * @default 0.75
 * @range 0.4, 3
 */
uniform float u_radius;

/**
 * @label Pointer radius (px)
 * @default 140
 * @range 0, 400
 */
uniform float u_hover;

/**
 * @label Accent amount
 * @default 0.8
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
  vec2 cell = floor(frag / u_pitch);
  vec2 c = (cell + 0.5) * u_pitch;                       // dot centre
  float t = u_time * u_speed;
  float breathe = 0.35 + 0.65 * smoothstep(0.3, 0.75, fbm(c / 700.0 + vec2(t, -0.5 * t)));

  float md = length(c - u_mouse) / max(u_hover, 1.0);
  float near = exp(-md * md * 2.0);
  float r = u_radius * (1.0 + 0.8 * near);
  float dotA = 1.0 - smoothstep(r - 0.5, r + 0.5, length(frag - c));
  float mask = marginMask(c);

  vec3 ink = mix(u_ink, u_accent, near * u_accentAmount);
  float a = dotA * mask * u_inkStrength * clamp(breathe + near, 0.0, 1.6);
  gl_FragColor = vec4(mix(u_bg, ink, a), 1.0);
}
