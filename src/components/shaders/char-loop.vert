#version 300 es
// The ∞ the curtain's characters gather into when the cursor shakes (see home/avatar.tsx). No
// buffers: each point's id seeds the wall cell it leaves from, its place in the loop's frayed
// tube, how fast it flows round and which characters it flickers through. Lengths are CSS px,
// y pointing down.

uniform vec2 u_res; // device px
uniform float u_dpr;
uniform vec2 u_cell; // CSS px per character cell of the wall
uniform vec2 u_grid; // the wall's columns, rows
uniform float u_time; // s, the loop's own clock
uniform float u_form; // 0 = every character home in the wall, 1 = all in the loop
uniform float u_p; // the curtain: lifting it takes the loop with it
uniform float u_seed;
uniform float u_size; // px, a character in the loop at middle depth
uniform float u_glyphs;

out float v_glyph;
out float v_alpha;
out float v_lit;

float hash(float n, float k) {
  return fract(sin(n * 12.9898 + k * 78.233 + u_seed) * 43758.5453);
}

void main() {
  float id = float(gl_VertexID);
  vec2 view = u_res / u_dpr;
  vec2 home = (floor(vec2(hash(id, 1.0), hash(id, 2.0)) * u_grid) + 0.5) * u_cell;

  // Lemniscate of Bernoulli, flowing: every character runs round it at its own pace, surging
  // and lagging on its own rhythm, so none of them keep station.
  float s = hash(id, 3.0) * 6.2832 + u_time * mix(3.2, 5.6, hash(id, 4.0))
    + 0.6 * sin(u_time * mix(0.7, 1.9, hash(id, 15.0)) + hash(id, 16.0) * 6.2832);
  float d = 1.0 + sin(s) * sin(s);
  vec3 p = vec3(cos(s) / d, sin(s) * cos(s) / d, 0.0);
  // The lobes take turns swelling, on two rhythms that never quite line up.
  p.xy *= 1.0 + (0.14 * sin(u_time * 1.2) + 0.07 * sin(u_time * 2.9 + 1.3)) * p.x;
  // A tight tube where each character drifts in and out on its own breath...
  vec3 o = normalize(vec3(hash(id, 5.0), hash(id, 6.0), hash(id, 7.0)) - 0.5 + 1e-4);
  float r = 0.16 * pow(hash(id, 8.0), 0.6) * (0.85 + 0.15 * sin(u_time * mix(1.0, 3.0, hash(id, 17.0)) + id));
  // Thick and thin stretches that drift round the loop, so the band is never even.
  r *= 0.85 + 0.3 * (0.5 + 0.5 * sin(s * 3.0 + u_time * 1.3)) * (0.6 + 0.4 * sin(s * 5.0 - u_time * 0.9));
  // ...and now and then a stray is flung well clear before drifting back.
  r += 0.15 * pow(hash(id, 18.0), 12.0) * max(0.0, sin(u_time * mix(0.5, 1.5, hash(id, 19.0)) + id));
  p += o * r;
  // Gusts: a flow field that ripples the tube, the ripples travelling along it.
  p += 0.015 * vec3(
    sin(p.y * 9.0 + u_time * 3.1),
    sin(p.x * 7.0 - u_time * 2.3),
    sin((p.x + p.y) * 5.0 + u_time * 1.7)
  );
  // Turned so one lobe comes nearer than the other, swaying unevenly, seen in perspective.
  float ry = 0.32 + 0.09 * sin(u_time * 0.3) + 0.05 * sin(u_time * 0.83 + 2.0);
  p = vec3(cos(ry) * p.x + sin(ry) * p.z, p.y, -sin(ry) * p.x + cos(ry) * p.z);
  float rx = 0.25 + 0.06 * sin(u_time * 0.47 + 1.0);
  p = vec3(p.x, cos(rx) * p.y - sin(rx) * p.z, sin(rx) * p.y + cos(rx) * p.z);
  float persp = 2.6 / (2.6 - p.z);
  float size = min(view.x * 0.29, view.y * 0.75); // room for the near lobe at its biggest
  vec2 loop = view * 0.5 + vec2(p.x, -p.y) * size * persp;

  // Characters leave the wall at staggered moments and swerve off the straight line on the way,
  // so the crowd looks frantic rather than marching.
  float k = clamp(u_form * 1.5 - hash(id, 9.0) * 0.5, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec2 dir = loop - home;
  vec2 pos = mix(home, loop, k) + vec2(-dir.y, dir.x) * sin(k * 3.1416) * (hash(id, 10.0) - 0.5) * 0.8;

  gl_Position = vec4(pos / view * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
  // At home a point is exactly a wall cell; in the loop it shrinks and scales with depth.
  gl_PointSize = mix(u_cell.y, u_size * persp, k) * u_dpr;
  v_glyph = floor(hash(id + floor(u_time * mix(2.0, 8.0, hash(id, 11.0))), 12.0) * u_glyphs);
  // Invisible at home (the wall shows its own character there), brighter nearer the eye.
  v_alpha = k * u_p * mix(0.35, 1.0, hash(id, 13.0)) * clamp(persp - 0.55, 0.3, 1.0);
  v_lit = step(0.15, hash(id, 14.0)); // mostly accent, a few in the text colour for sparkle
}
