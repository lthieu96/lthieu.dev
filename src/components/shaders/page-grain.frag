#version 300 es
// Ported from design/shaders/grain-wash.glsl, without the pointer term or the corner accent glow
// (it lit one margin only). Lengths are in CSS px and scaled by u_pixelRatio; the grain stays at
// 1 device px so it reads as film, not dots.
// mediump to match the library vertex shader; it upgrades both to highp where mediump is weak.
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;

uniform float u_warpScale;
uniform float u_inkStrength;
uniform float u_grain;
uniform float u_speed;
uniform float u_colHalf;
uniform float u_feather;
uniform vec3 u_bg;
uniform vec3 u_ink;

out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 frag = gl_FragCoord.xy;

  // margin-only: nothing behind the content column, feathered at its edges, fading out at the bottom
  float dx = abs(frag.x - 0.5 * u_resolution.x) - u_colHalf * u_pixelRatio;
  float mask = smoothstep(0.0, u_feather * u_pixelRatio, dx) * smoothstep(0.0, 0.35, frag.y / u_resolution.y);
  if (mask <= 0.0) {
    fragColor = vec4(u_bg, 1.0);
    return;
  }

  // the wash follows Paper Shaders' "warp" shape (iterated cosine domain warp, then a sin ridge),
  // so it gathers in narrow sweeping bands with open paper between them
  float t = 0.5 * u_time * u_speed;
  vec2 w = frag / (u_warpScale * u_pixelRatio);
  for (float i = 1.0; i < 6.0; i++) {
    w.x += 0.6 / i * cos(i * 2.5 * w.y + t);
    w.y += 0.6 / i * cos(i * 1.5 * w.x + t);
  }
  float v = smoothstep(0.02, 1.4, 0.15 / max(0.001, abs(sin(t - w.y - w.x))));

  vec3 col = mix(u_bg, u_ink, v * u_inkStrength * mask);
  // static grain (no time term): animated grain shimmers and reads as noise. About 70% of pixels
  // get a speck, so it reads as grain rather than as a solid film.
  vec2 px = floor(frag);
  col += step(0.3, hash(px + 31.7)) * (hash(px) - 0.5) * u_grain * mask;
  fragColor = vec4(col, 1.0);
}
