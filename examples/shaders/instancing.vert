precision highp float;

#pragma glslify: computeMiterNormal = require(../../src/shaders/compute-miter-normal)

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform float aspect;

uniform float thickness;
uniform float miterLimit;

attribute vec2 prevPosition;
attribute vec2 currPosition;
attribute vec2 nextPosition;

attribute float offset;
attribute vec4 color;
attribute vec2 ud;

attribute float angle;

varying vec4 vColor;
varying vec2 vUD;

vec2 rotatedPosition (vec2 position, float angle) {
  return vec2(
    +cos(angle) * position.x + position.y * sin(angle),
    -sin(angle) * position.x + position.y * cos(angle));
}

void main() {
  mat4 projViewModel = projection * view * model;

  vec4 prevProjected = projViewModel *
    vec4(rotatedPosition(prevPosition, angle), 0.0, 1.0);
  vec4 currProjected = projViewModel *
    vec4(rotatedPosition(currPosition, angle), 0.0, 1.0);
  vec4 nextProjected = projViewModel *
    vec4(rotatedPosition(nextPosition, angle), 0.0, 1.0);

  vec2 normal = computeMiterNormal(
    aspect, thickness, miterLimit,
    prevProjected, currProjected, nextProjected);

  vColor = color;
  vUD = ud;

  gl_Position = currProjected + vec4(normal * offset, 0.0, 1.0);
}
