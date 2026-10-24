#version 300 es
// Ported from design/image-dither.glsl. The image is dithered into a few tones of a duotone,
// and u_reveal (0..1) wipes to full colour with a dithered edge, or with u_clear to transparent,
// uncovering whatever sits underneath. With u_radial the wipe opens as a circle from u_from.
// mediump to match the library vertex shader; it upgrades both to highp where mediump is weak.
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_imageAspectRatio; // set by ShaderMount when u_image loads
uniform float u_cell;
uniform float u_reveal;
uniform float u_clear;
uniform float u_plain; // show the image itself, not the dither, until it clears
uniform float u_radial;
uniform vec2 u_from; // circle centre in uv, y up; may lie outside the image
uniform float u_maxd; // distance from u_from to the farthest corner, in uv-height units
uniform float u_contrast;
uniform float u_invert;
uniform float u_levels;
uniform float u_gamma;
uniform vec3 u_shadow;
uniform vec3 u_light;

out vec4 fragColor;

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// object-fit: cover, and flip y (texture rows start at the top, gl_FragCoord at the bottom)
vec2 cover(vec2 uv) {
  float box = u_resolution.x / u_resolution.y;
  vec2 s = box > u_imageAspectRatio ? vec2(1.0, u_imageAspectRatio / box) : vec2(box / u_imageAspectRatio, 1.0);
  vec2 c = (uv - 0.5) * s + 0.5;
  return vec2(c.x, 1.0 - c.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 src = texture(u_image, cover(uv));

  float cellPx = u_cell * u_pixelRatio;
  vec2 cell = floor(gl_FragCoord.xy / cellPx);
  vec4 s = texture(u_image, cover((cell + 0.5) * cellPx / u_resolution));
  float l = dot(s.rgb / max(s.a, 0.001), vec3(0.299, 0.587, 0.114));
  l = mix(l, 1.0 - l, u_invert);
  l = pow(clamp((l - 0.5) * u_contrast + 0.5, 0.0, 1.0), u_gamma);
  float th = bayer8(cell);
  // ordered dither into a few tonal steps keeps UI structure legible
  float n = u_levels - 1.0;
  float q = clamp(floor(l * n + th), 0.0, n) / n;
  vec4 dithered = vec4(mix(u_shadow, u_light, q) * s.a, s.a);

  // The wipe edge is a dithered band (30% of the width), so the reveal reads as pixels resolving
  // rather than a hard line. Offsets keep reveal=0 fully dithered and reveal=1 fully in colour.
  float edge = uv.x - u_reveal * 1.32 + 0.16 + (th - 0.5) * 0.3;
  if (u_radial > 0.5) {
    float d = length((uv - u_from) * vec2(u_resolution.x / u_resolution.y, 1.0)) / u_maxd;
    edge = d - u_reveal * 1.25 + 0.12 + (th - 0.5) * 0.25;
  }
  float showColour = step(edge, 0.0);
  fragColor = mix(mix(dithered, src, u_plain), src * (1.0 - u_clear), showColour);
}
