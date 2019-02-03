attribute vec4 position;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

void main() {
  gl_PointSize = 5.0;
  gl_Position = projection * view * model * position;
}
