precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Cell size
 * @default 5
 * @range 2, 16
 */
uniform float u_cell;

/**
 * @label Density
 * @default 0.55
 * @range 0, 1
 */
uniform float u_density;

/**
 * @label Ink strength
 * @default 0.55
 * @range 0, 1
 */
uniform float u_inkStrength;

/**
 * @label Speed
 * @default 0.06
 * @range 0, 0.3
 */
uniform float u_speed;

/**
 * @label Accent amount
 * @default 1
 * @range 0, 1
 */
uniform float u_accentAmount;

/**
 * @label Column half-width (px, 0 = off)
 * @default 0
 * @range 0, 600
 */
uniform float u_colHalf;

/**
 * @label Column feather (px)
 * @default 72
 * @range 0, 200
 */
uniform float u_feather;

/**
 * @label Background
 * @color
 * @default #111111
 */
uniform vec3 u_bg;

/**
 * @label Ink
 * @color
 * @default #EDEDED
 */
uniform vec3 u_ink;

/**
 * @label Accent
 * @color
 * @default #8CC4F2
 */
uniform vec3 u_accent;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

// ordered-dither threshold (Bayer 8x8) in [0,1)
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_cell);
  vec2 uv = (cell * u_cell + 0.5 * u_cell) / u_resolution;
  vec2 p = vec2(uv.x * u_resolution.x / u_resolution.y, uv.y);
  float t = u_time * u_speed;

  // domain-warped flow: reads like a slow data terrain
  vec2 q = vec2(fbm(p * 1.6 + vec2(t, 0.0)), fbm(p * 1.6 + vec2(5.2, -t)));
  float v = fbm(p * 2.2 + 2.4 * q + vec2(t * 0.5, 0.0));

  // mouse lifts density locally
  vec2 m = u_mouse / u_resolution;
  float lift = 0.1 * exp(-12.0 * dot(uv - m, uv - m));

  float mask;
  if (u_colHalf > 0.0) {
    // margin-only: nothing behind the content column, feathered at its edges
    float dx = abs(gl_FragCoord.x - 0.5 * u_resolution.x) - u_colHalf;
    mask = smoothstep(0.0, u_feather, dx) * smoothstep(0.0, 0.35, uv.y);
  } else {
    // fade to background toward the left/bottom so copy stays readable
    mask = smoothstep(0.2, 0.85, uv.x + 0.35 * uv.y);
    mask *= smoothstep(0.2, 0.42, length((uv - vec2(0.45, 0.24)) * vec2(1.0, 1.9)));
    mask *= 1.0 - smoothstep(0.82, 0.93, uv.y) * (1.0 - smoothstep(0.7, 0.8, uv.x));
  }
  float d = clamp((v - (1.0 - u_density)) * 2.2 + lift, 0.0, 1.0) * mask;

  float on = d > bayer8(cell) + 0.002 ? 1.0 : 0.0;

  // square dots with a 1px gutter, LED-style
  vec2 f = fract(gl_FragCoord.xy / u_cell);
  float dotMask = step(1.0 / u_cell, f.x) * step(1.0 / u_cell, f.y);

  vec3 ink = mix(mix(u_bg, u_ink, u_inkStrength), u_accent, u_accentAmount * smoothstep(0.78, 0.95, d));
  gl_FragColor = vec4(mix(u_bg, ink, on * dotMask), 1.0);
}
