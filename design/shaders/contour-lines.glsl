// Contour lines: 1px topographic isolines of a slow domain-warped height field.
// Every 5th line is an index line in the accent. Three fbm samples per pixel for the gradient.
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
 * @label Line ink
 * @default 0.14
 * @range 0, 0.5
 */
uniform float u_inkStrength;

/**
 * @label Lines (levels)
 * @default 28
 * @range 4, 40
 */
uniform float u_levels;

/**
 * @label Index line accent
 * @default 0.6
 * @range 0, 1
 */
uniform float u_accentAmount;

/**
 * @label Noise scale (px)
 * @default 1100
 * @range 200, 3000
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

float height(vec2 frag, float t) {
  vec2 p = frag / u_scale;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, -t)));
  float h = fbm(p * 1.3 + 1.2 * q);
  // the pointer raises a small hill, so lines bend around it
  float md = length(frag - u_mouse) / 160.0;
  return h + 0.06 * exp(-md * md);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = u_time * u_speed;
  float h = height(frag, t) * u_levels;
  // numeric gradient (WebGL1 has no fwidth without an extension)
  float hx = height(frag + vec2(1.0, 0.0), t) * u_levels;
  float hy = height(frag + vec2(0.0, 1.0), t) * u_levels;
  float g = max(length(vec2(hx - h, hy - h)), 1e-4);
  float dist = abs(fract(h + 0.5) - 0.5) / g;          // px to the nearest isoline
  float line = 1.0 - smoothstep(0.5, 1.25, dist);       // ~1px hairline
  float idx = step(mod(floor(h + 0.5), 5.0), 0.5);      // every 5th level
  float mask = marginMask(frag);

  vec3 ink = mix(u_ink, u_accent, idx * u_accentAmount);
  float a = line * mask * u_inkStrength * mix(1.0, 1.6, idx);
  gl_FragColor = vec4(mix(u_bg, ink, a), 1.0);
}
