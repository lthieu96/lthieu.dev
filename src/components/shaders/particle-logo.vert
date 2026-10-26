#version 300 es
// Each particle is drawn LAYERS times back along z (an extruded slab). Points snap to the cell
// grid and their shade is quantised to 4 levels of the brand colour with an 8x8 Bayer matrix, so
// the logo stays a crisp dither while it moves.
// Prototype: /tmp/particle-logo/index.html.

in vec3 a_pos;
in vec3 a_col;

uniform vec2 u_res;
uniform float u_cell; // device px per grid cell
uniform float u_layers;
uniform float u_step; // depth between layers
uniform float u_scale;
uniform vec2 u_rot; // x, y rotation in radians
uniform vec3 u_shade; // front face lo, front face hi, side (0..1 before quantising)

flat out vec3 v_col;

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

vec3 rot(vec3 p) {
  float c = cos(u_rot.y), s = sin(u_rot.y);
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  c = cos(u_rot.x); s = sin(u_rot.x);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

// Camera at z = 2.4.
vec2 project(vec3 r) { return r.xy * (2.4 / (2.4 - r.z)) * u_scale; }

vec4 snap(vec2 q, float z, out vec2 cell) {
  cell = floor((q * 0.5 + 0.5) * u_res / u_cell);
  return vec4((cell + 0.5) * u_cell / u_res * 2.0 - 1.0, z, 1.0);
}

void main() {
  float layer = float(gl_InstanceID);
  vec2 cell;
  gl_PointSize = ceil(u_cell);

  vec3 r = rot(a_pos - vec3(0.0, 0.0, layer * u_step));
  vec2 q = project(r);
  gl_Position = snap(q, -r.z * 0.3, cell);

  float b;
  if (layer < 0.5) {
    // Front face: lit from the top left, plus a sheen that slides across as the slab turns.
    vec3 n = rot(vec3(0.0, 0.0, 1.0));
    float diag = clamp((q.x - q.y + 2.0) * 0.25, 0.0, 1.0);
    float sheen = exp(-pow((q.x - q.y) * 0.5 + u_rot.y * 2.5, 2.0) * 12.0);
    float lit = 0.6 * (1.0 - diag) + 0.5 * dot(n, normalize(vec3(-0.5, 0.6, 1.0))) - 0.25;
    b = mix(u_shade.x, u_shade.y, clamp(lit + 0.4 * sheen, 0.0, 1.0));
  } else {
    b = u_shade.z * (1.0 - 0.5 * layer / u_layers);
  }
  // Side -> mid -> brand -> highlight. Sides keep 60%+ of the brand colour, so dark brands
  // (Express, Sentry) keep their hue instead of turning black. The highlight is weaker on dark
  // brands: on black, 40% white is the shadow's grey, and the sheen read as shadow on the face.
  float l = clamp(floor(b * 3.0 + bayer8(cell)), 0.0, 3.0) / 3.0;
  float hi = 0.2 + 0.2 * max(a_col.r, max(a_col.g, a_col.b));
  v_col = l < 0.7 ? mix(a_col * 0.6, a_col, l * 1.5) : mix(a_col, vec3(1.0), hi);
}
