/* Particle shaders for Prometheus Hub.
   Technique adapted from MisterPrada/morph-particles:
   https://github.com/MisterPrada/morph-particles
   Positions live in float data textures. A simulation pass mixes the
   chapter shapes, then blends toward a focused wing. Points draw additively.
   The palette is silver, ice, and muted lavender. No warm metal. */

export const simulationVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const simulationFrag = /* glsl */ `
precision highp float;

uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uC;
uniform sampler2D uD;
uniform sampler2D uFocus;
uniform float uTime;
uniform float uScroll;
uniform float uFocusMix;
uniform vec2 uPointer;
uniform float uPull;

varying vec2 vUv;

mat3 rotX(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotY(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

float rand(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / max(0.0001, inMax - inMin);
}

float ease(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float range = 1.0 / 3.0;
  float wobble = uTime;

  float sway = sin(wobble * 0.32);
  vec3 A = rotX(sway * 0.1) * rotY(sin(wobble * 0.21) * 0.16) * texture2D(uA, vUv).xyz;
  vec3 B = rotY(sin(wobble * 0.27) * 0.2) * texture2D(uB, vUv).xyz;
  vec3 C = rotY(sin(wobble * 0.23) * 0.16) * texture2D(uC, vUv).xyz;
  vec3 D = rotX(0.1 + sway * 0.06) * texture2D(uD, vUv).xyz;

  float stagger = rand(vUv) * 0.14;
  vec3 pos;

  if (uScroll < range) {
    float t = ease(remap(clamp(uScroll - stagger * 0.4, 0.0, range - stagger), 0.0, range - stagger, 0.0, 1.0));
    pos = mix(A, B, t);
  } else if (uScroll < range * 2.0) {
    float t = ease(remap(clamp(uScroll - stagger * 0.4, range, range * 2.0 - stagger), range, range * 2.0 - stagger, 0.0, 1.0));
    pos = mix(B, C, t);
  } else {
    float t = ease(remap(clamp(uScroll - stagger * 0.4, range * 2.0, 1.0 - stagger), range * 2.0, 1.0 - stagger, 0.0, 1.0));
    pos = mix(C, D, t);
  }

  vec3 focused = rotY(sin(wobble * 0.3) * 0.28) * texture2D(uFocus, vUv).xyz;
  pos = mix(pos, focused, clamp(uFocusMix, 0.0, 1.0));

  float breath = sin(wobble * 0.55 + vUv.x * 14.0) * cos(wobble * 0.42 + vUv.y * 11.0);
  pos += breath * 0.012;

  vec2 aim = uPointer * vec2(1.85, 1.05);
  vec2 delta = aim - pos.xy;
  float dist = length(delta);
  float influence = smoothstep(1.85, 0.05, dist);
  pos.xy += delta * influence * uPull;
  pos.z += influence * uPull * 0.22;

  gl_FragColor = vec4(pos, 1.0);
}
`;

export const pointsVert = /* glsl */ `
uniform sampler2D uPositions;
uniform float uSize;
uniform vec2 uResolution;

varying float vSpark;
varying float vRadius;

void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float spark = fract(sin(dot(position.xy, vec2(127.1, 311.7))) * 43758.5453);
  vSpark = spark;
  vRadius = length(pos.xy);

  float size = uSize * mix(0.62, 1.28, spark);
  float viewZ = max(0.45, -mvPosition.z);
  gl_PointSize = size * uResolution.y * 0.0064 / viewZ;
  gl_PointSize = clamp(gl_PointSize, 1.15, 36.0);
}
`;

export const pointsFrag = /* glsl */ `
precision highp float;

varying float vSpark;
varying float vRadius;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  if (d > 0.5) discard;

  float glow = clamp(0.026 / max(d, 0.014) - 0.04, 0.0, 0.58);
  float grain = smoothstep(0.5, 0.06, d);
  float alpha = max(glow, grain * 0.16);
  if (alpha < 0.012) discard;

  vec3 ice = vec3(0.56, 0.80, 0.94);
  vec3 lav = vec3(0.72, 0.64, 0.90);
  vec3 silver = vec3(0.78, 0.84, 0.93);
  vec3 pearl = vec3(0.96, 0.97, 1.0);

  float core = smoothstep(1.45, 0.05, vRadius);
  vec3 color = mix(lav, ice, smoothstep(0.15, 0.9, vSpark));
  color = mix(color, silver, 0.32);
  color = mix(color, pearl, core * 0.82 + smoothstep(0.36, 0.58, glow) * 0.7);

  alpha *= mix(0.72, 1.0, smoothstep(2.6, 0.15, vRadius));
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

export const starVert = /* glsl */ `
uniform float uTime;
attribute float aSize;
varying float vSize;
void main() {
  vec3 pos = position;
  pos.x += sin(uTime * 0.12 + position.y) * 0.03;
  pos.y += cos(uTime * 0.1 + position.x) * 0.02;
  vec4 mv = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  vSize = aSize;
  gl_PointSize = clamp(aSize * (150.0 / max(0.4, -mv.z)), 1.0, 10.0);
}
`;

export const starFrag = /* glsl */ `
precision highp float;
varying float vSize;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d);
  alpha *= alpha;
  vec3 ice = vec3(0.70, 0.82, 0.96);
  vec3 pearl = vec3(0.95, 0.97, 1.0);
  vec3 lav = vec3(0.78, 0.74, 0.94);
  vec3 color = mix(ice, pearl, smoothstep(1.2, 3.6, vSize));
  color = mix(color, lav, step(0.82, fract(vSize * 1.7)) * 0.35);
  gl_FragColor = vec4(color * alpha, alpha * 0.55);
}
`;
