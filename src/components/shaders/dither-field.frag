#version 300 es
// Ported from design/dither-flow.glsl (margin-only mode). Lengths are in CSS px and scaled by
// u_pixelRatio, so cells stay 2px on every screen.
// mediump to match the library vertex shader; it upgrades both to highp where mediump is weak.
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;

uniform vec2 u_mouse; // CSS px from the top-left; far away when there's no pointer
uniform float u_cell;
uniform float u_density;
uniform float u_inkStrength;
uniform float u_speed;
uniform float u_colHalf;
uniform float u_feather;
uniform vec3 u_bg;
uniform vec3 u_ink;

out vec4 fragColor;

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

// Ordered-dither threshold (Bayer 8x8) in [0,1)
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  float cellPx = u_cell * u_pixelRatio;
  vec2 cell = floor(gl_FragCoord.xy / cellPx);
  vec2 uv = (cell * cellPx + 0.5 * cellPx) / u_resolution;
  // noise scale in CSS px, matched to the ~2500px-tall page frame in the design
  vec2 p = (cell * cellPx + 0.5 * cellPx) / u_pixelRatio / 2500.0;
  float t = u_time * u_speed;

  // domain-warped flow: reads like a slow data terrain
  vec2 q = vec2(fbm(p * 1.6 + vec2(t, 0.0)), fbm(p * 1.6 + vec2(5.2, -t)));
  float v = fbm(p * 2.2 + 2.4 * q + vec2(t * 0.5, 0.0));

  // the pointer lifts density locally
  vec2 m = vec2(u_mouse.x, u_resolution.y / u_pixelRatio - u_mouse.y) * u_pixelRatio / u_resolution;
  float lift = 0.1 * exp(-12.0 * dot(uv - m, uv - m));

  // margin-only: nothing behind the content column, feathered at its edges, fading out at the bottom
  float dx = abs(gl_FragCoord.x - 0.5 * u_resolution.x) - u_colHalf * u_pixelRatio;
  float mask = smoothstep(0.0, u_feather * u_pixelRatio, dx) * smoothstep(0.0, 0.35, uv.y);
  float d = clamp((v - (1.0 - u_density)) * 2.2 + lift, 0.0, 1.0) * mask;

  // strict > so zero-density cells never light up
  float on = d > bayer8(cell) + 0.002 ? 1.0 : 0.0;

  // square dots with a 1 CSS px gutter, LED-style
  vec2 f = fract(gl_FragCoord.xy / cellPx);
  float dotMask = step(1.0 / u_cell, f.x) * step(1.0 / u_cell, f.y);

  vec3 ink = mix(u_bg, u_ink, u_inkStrength);
  fragColor = vec4(mix(u_bg, ink, on * dotMask), 1.0);
}
