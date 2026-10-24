#version 300 es
// Ported from design/shaders/halftone-drift.glsl, without the pointer term. Lengths are in CSS px
// and scaled by u_pixelRatio, so the dot pitch stays the same on every screen.
// mediump to match the library vertex shader; it upgrades both to highp where mediump is weak.
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;

uniform float u_pitch;
uniform float u_scale;
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
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

void main() {
  float pr = u_pixelRatio;
  vec2 frag = gl_FragCoord.xy;
  // 45 degree print screen: dots sit on a rotated grid, one per cell
  mat2 rot = mat2(0.7071, -0.7071, 0.7071, 0.7071);
  float pitch = u_pitch * pr;
  vec2 g = rot * frag;
  vec2 cg = (floor(g / pitch) + 0.5) * pitch;
  vec2 c = cg * rot; // cell centre back in screen space

  // clear behind the middle (colHalf 0 clears only a thin centre line), fading out at the bottom
  float dx = abs(c.x - 0.5 * u_resolution.x) - u_colHalf * pr;
  float mask = smoothstep(0.0, u_feather * pr, dx) * smoothstep(0.0, 0.35, c.y / u_resolution.y);

  // tone comes in clouds: open paper between them, so the field never reads as a flat screen
  vec2 p = c / (u_scale * pr);
  float t = u_time * u_speed;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, -t)));
  float v = smoothstep(0.42, 0.72, fbm(p * 1.6 + 1.6 * q)) * u_density * mask;

  // dot size carries the tone, so the feather becomes dots shrinking to nothing
  float r = 0.45 * pitch * sqrt(v);
  float dotA = 1.0 - smoothstep(r - 0.6 * pr, r + 0.6 * pr, length(g - cg));
  fragColor = vec4(mix(u_bg, u_ink, dotA * step(0.001, v) * u_inkStrength), 1.0);
}
