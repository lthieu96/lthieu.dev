#version 300 es
// One character of the ∞ (see char-loop.vert), cut from the same glyph atlas as the wall.

precision highp float;

uniform sampler2D u_atlas; // white glyphs on clear, u_atlasCols per row
uniform vec2 u_atlasCell; // atlas px per glyph
uniform float u_atlasCols;
uniform vec2 u_cell; // a glyph's cell shape: narrower than the square point it's drawn in
uniform vec3 u_fg;
uniform vec3 u_accent;

in float v_glyph;
in float v_alpha;
in float v_lit;

out vec4 outColor;

void main() {
  vec2 pc = gl_PointCoord;
  pc.x = (pc.x - 0.5) * (u_cell.y / u_cell.x) + 0.5;
  if (v_alpha <= 0.0 || pc.x < 0.0 || pc.x > 1.0) discard;
  vec2 origin = vec2(mod(v_glyph, u_atlasCols), floor(v_glyph / u_atlasCols)) * u_atlasCell;
  float a = v_alpha * texture(u_atlas, (origin + pc * u_atlasCell) / vec2(textureSize(u_atlas, 0))).a;
  outColor = vec4(mix(u_fg, u_accent, v_lit) * a, a);
}
