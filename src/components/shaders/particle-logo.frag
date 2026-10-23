#version 300 es
precision mediump float;

flat in vec3 v_col;
out vec4 fragColor;

void main() { fragColor = vec4(v_col, 1.0); }
