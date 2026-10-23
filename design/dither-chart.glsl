precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Cell size
 * @default 2
 * @range 1, 8
 */
uniform float u_cell;

/**
 * @label Ink strength
 * @default 0.5
 * @range 0, 1
 */
uniform float u_inkStrength;

/**
 * @label Speed
 * @default 0.05
 * @range 0, 0.5
 */
uniform float u_speed;

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
 * @label Line
 * @color
 * @default #EDEDED
 */
uniform vec3 u_line;

float hash(float x) { return fract(sin(x * 91.17) * 43758.5453); }
float noise(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }
float series(float x) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(x); x = x * 2.1 + 3.7; a *= 0.5; }
  return v;
}

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_cell);
  vec2 uv = (cell + 0.5) * u_cell / u_resolution;
  float t = u_time * u_speed;

  // a price-like series scrolling left, with a slow upward drift
  float y = 0.18 + 0.62 * series(uv.x * 6.0 + t * 6.0) + 0.12 * uv.x;

  // area under the curve: dense near the line, thinning toward the baseline
  float below = y - uv.y;
  float area = below > 0.0 ? mix(0.05, 0.7, exp(-below * 5.0)) : 0.0;
  area *= smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);

  float on = area > bayer8(cell) + 0.002 ? 1.0 : 0.0;
  vec3 col = mix(u_bg, mix(u_bg, u_ink, u_inkStrength), on);

  // crisp 1-cell line on top of the area
  float line = 1.0 - smoothstep(0.0, 1.5 * u_cell / u_resolution.y, abs(below));
  line *= smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
  col = mix(col, u_line, line);

  gl_FragColor = vec4(col, 1.0);
}
