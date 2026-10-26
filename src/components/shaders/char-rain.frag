#version 300 es
// The avatar's curtain of characters (see home/avatar.tsx). Every pixel works out on its own
// which cell it's in, whether the curtain has reached it, its character from the glyph atlas,
// how lit that character is by the two drops running down its column, and any halo from the
// cells around it. The drops are pure functions of time, so they need no state on the CPU.
// Lengths are CSS px, y pointing down.

precision highp float;

uniform vec2 u_res; // device px
uniform float u_dpr;
uniform vec2 u_cell; // CSS px per character cell
uniform vec2 u_grid; // columns, rows
uniform float u_time; // s
uniform float u_p; // 0 = curtain up, 1 = down
uniform float u_ragged; // how far a column's front may trail the curtain edge
uniform float u_pouring; // 1 while the curtain comes down
uniform float u_form; // 0..1: how far the characters have left for the ∞ (char-loop.vert)
uniform float u_seed;
uniform vec3 u_bg;
uniform vec3 u_fg;
uniform vec3 u_accent;
uniform float u_dim; // a character's alpha away from any light
uniform float u_trail; // alpha at a drop's head
uniform float u_halo; // px across the soft light behind a glowing character
uniform sampler2D u_atlas; // white glyphs on clear, u_atlasCols per row
uniform vec2 u_atlasCell; // atlas px per glyph
uniform float u_atlasCols;
uniform sampler2D u_state; // per cell: r = glyph index / 255, g = cursor heat

out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + u_seed) * 43758.5453);
}

float screenH() {
  return u_res.y / u_dpr;
}

// Where column c's curtain ends.
float bottomOf(float c) {
  return u_p * (screenH() + u_ragged) - hash(vec2(c, 7.0)) * u_ragged;
}

// Drop k of column c: x = head y, y = tail length. Each falls at its own speed and comes back
// round after a gap of up to a screen, so the columns never fall into step.
vec2 drop(float c, float k) {
  float v = mix(35.0, 120.0, hash(vec2(c, k + 1.0)));
  float tail = (5.0 + floor(hash(vec2(c, k + 11.0)) * 14.0)) * u_cell.y;
  float span = screenH() + tail;
  float cycle = span * (1.0 + hash(vec2(c, k + 21.0)));
  float y = mod(u_time * v + hash(vec2(c, k + 31.0)) * cycle, cycle) - (cycle - span);
  return vec2(y, tail);
}

// How strongly a cell's halo shows: only the leading character, while the curtain pours.
float glowOf(vec2 cell) {
  float b = bottomOf(cell.x);
  float y = cell.y * u_cell.y;
  if (u_pouring < 0.5 || y >= b || y + u_cell.y < b) return 0.0;
  return clamp((b - y) / u_cell.y, 0.0, 1.0);
}

vec4 over(vec4 top, vec4 under) {
  return top + under * (1.0 - top.a);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;
  vec2 cell = floor(px / u_cell);
  float bottom = bottomOf(cell.x);
  vec4 col = px.y < bottom ? vec4(u_bg, 1.0) : vec4(0.0);

  // Halos reach about a cell, so look at this cell and its eight neighbours.
  for (float dy = -1.0; dy <= 1.0; dy++) {
    for (float dx = -1.0; dx <= 1.0; dx++) {
      vec2 n = cell + vec2(dx, dy);
      if (n.x < 0.0 || n.y < 0.0 || n.x >= u_grid.x || n.y >= u_grid.y) continue;
      float g = glowOf(n);
      if (g <= 0.0) continue;
      float d = length(px - (n + 0.5) * u_cell);
      float a = 0.22 * g * max(0.0, 1.0 - d / (u_halo * 0.5));
      col = over(vec4(u_accent * a, a), col);
    }
  }

  float y = cell.y * u_cell.y;
  if (y < bottom && cell.y < u_grid.y) {
    float a = u_dim;
    float lit = 0.0;
    // A drop is accent, brightest at its head and fading along its trail. It ramps across a
    // cell rather than jumping from one character to the next.
    for (float k = 0.0; k < 2.0; k++) {
      vec2 d = drop(cell.x, k);
      float dist = d.x - y;
      if (dist <= -u_cell.y || dist >= d.y) continue;
      float t = u_trail * (dist < 0.0 ? 1.0 + dist / u_cell.y : pow(1.0 - dist / d.y, 1.6));
      if (t > a) {
        a = t;
        lit = 1.0;
      }
    }
    vec4 state = texelFetch(u_state, ivec2(cell), 0);
    if (state.g * 0.9 > a) {
      a = state.g * 0.9;
      lit = 1.0;
    }
    // Each column's leading character lights up while the curtain comes down.
    if (u_pouring > 0.5 && y + u_cell.y >= bottom) {
      a = max(a, 0.85);
      lit = 1.0;
    }
    float g = floor(state.r * 255.0 + 0.5);
    vec2 origin = vec2(mod(g, u_atlasCols), floor(g / u_atlasCols)) * u_atlasCell;
    vec2 uv = (origin + (px - cell * u_cell) / u_cell * u_atlasCell) / vec2(textureSize(u_atlas, 0));
    // The front row fades in as the curtain reaches it, instead of popping in whole.
    float alpha = a * clamp((bottom - y) / u_cell.y, 0.0, 1.0) * texture(u_atlas, uv).a;
    // The wall empties as its characters gather into the ∞, and fills again as they come home.
    alpha *= 1.0 - 0.85 * u_form;
    col = over(vec4(mix(u_fg, u_accent, lit) * alpha, alpha), col);
  }
  outColor = col;
}
