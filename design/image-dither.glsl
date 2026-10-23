precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @label Content */
uniform sampler2D u_content;

/**
 * @label Cell size
 * @default 2
 * @range 1, 8
 */
uniform float u_cell;

/**
 * @label Reveal (0 = dithered, 1 = full colour)
 * @default 0
 * @range 0, 1
 */
uniform float u_reveal;

/**
 * @label Contrast
 * @default 1.15
 * @range 0.5, 2
 */
uniform float u_contrast;

/**
 * @label Invert (for light UI screenshots)
 * @default 0
 * @range 0, 1
 */
uniform float u_invert;

/**
 * @label Levels
 * @default 4
 * @range 2, 8
 */
uniform float u_levels;

/**
 * @label Gamma
 * @default 0.7
 * @range 0.3, 1.5
 */
uniform float u_gamma;

/**
 * @label Shadow
 * @color
 * @default #141414
 */
uniform vec3 u_shadow;

/**
 * @label Light
 * @color
 * @default #9FB8CC
 */
uniform vec3 u_light;

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 src = texture2D(u_content, uv);

  vec2 cell = floor(gl_FragCoord.xy / u_cell);
  vec4 s = texture2D(u_content, (cell + 0.5) * u_cell / u_resolution);
  float l = dot(s.rgb / max(s.a, 0.001), vec3(0.299, 0.587, 0.114));
  l = mix(l, 1.0 - l, u_invert);
  l = pow(clamp((l - 0.5) * u_contrast + 0.5, 0.0, 1.0), u_gamma);
  float th = bayer8(cell);
  // ordered dither into a few tonal steps keeps UI structure legible
  float n = u_levels - 1.0;
  float q = clamp(floor(l * n + th), 0.0, n) / n;
  vec3 duo = mix(u_shadow, u_light, q);
  vec4 dithered = vec4(duo * s.a, s.a);

  // the wipe edge is dithered too, so the reveal reads as pixels resolving
  float edge = uv.x - u_reveal * 1.2 + 0.1;
  float showColour = step(edge + (th - 0.5) * 0.12, 0.0);
  gl_FragColor = mix(dithered, src, showColour);
}
