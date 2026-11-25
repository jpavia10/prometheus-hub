/**
 * Prometheus Hub — AAA Animated Splash Intro (ES Module)
 * Made by Gemini (hub_gemini_aaa-splash-intro-module_20261124-2030.js, supplemental, 2026-11-24); wired in by Claude for d85
 * (owner, 2026-11-25: "Gemini made a new intro splash i dont see that yet"). Claude's changes: the subtitle is an option (Gemini's
 * line printed Frazier Park's coordinates labelled "Mt. Pinos"); deck/views/orrery.js boot() mounts it once a session in place of
 * the old text card, and the town's own opening waits for it (the "prom:booted" event).
 *
 * Drop-in zero-dependency ES module:
 *   import { mountPrometheusSplash } from "./deck/splash.js";
 *   mountPrometheusSplash({ onComplete: () => {}, skipIfSeen: true });
 *
 * Features:
 *   - WebGL2 GLSL ES 3.00 volumetric shader (obsidian-indigo twilight sky,
 *     multi-layer Frazier Park / Mount Pinos ridge silhouettes with rim-lighting,
 *     volumetric amber-gold Promethean ember core, orbital constellation ring,
 *     rising ember motes, and anti-banding film dithering).
 *   - Graceful Canvas2D fallback with visual parity when WebGL2 is unavailable.
 *   - Interruptible spring dismiss (click / tap / Escape / Space).
 *   - Full `prefers-reduced-motion: reduce` instant static reveal (zero rAF loop).
 *   - Strict GPU & DOM resource disposal on exit (zero lingering rAF or WebGL cost).
 */

const SESSION_KEY = "prometheus.splash.seen.v1";
const STYLE_ID = "prometheus-splash-styles";

/* -------------------------------------------------------------------------- */
/*  GLSL ES 3.00 Shaders (WebGL2)                                             */
/* -------------------------------------------------------------------------- */

const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(POS[gl_VertexID], 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uDismiss;
uniform vec2 uPointer;

out vec4 fragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(17.1, 31.7);
    a *= 0.5;
  }
  return v;
}

float easeOutCubic(float x) {
  float t = clamp(x, 0.0, 1.0);
  return 1.0 - pow(1.0 - t, 3.0);
}

float easeInOutCubic(float x) {
  float t = clamp(x, 0.0, 1.0);
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
}

/* Frazier Park / Mount Pinos multi-ridge contour heights in normalized [0..1] y */
float ridgeFar(float x) {
  /* Broad Mount Pinos dome on left-center (8,847 ft), Cuddy Valley saddle, Frazier Mtn east */
  float pinos = 0.145 * exp(-pow((x + 0.30) * 2.15, 2.0));
  float sawmill = 0.088 * exp(-pow((x + 0.68) * 3.1, 2.0));
  float frazier = 0.125 * exp(-pow((x - 0.36) * 2.55, 2.0));
  float tecuya = 0.072 * exp(-pow((x - 0.78) * 3.2, 2.0));
  float crags = 0.024 * (fbm(vec2(x * 5.8, 1.7)) - 0.48) + 0.011 * (fbm(vec2(x * 15.0, 4.3)) - 0.5) + 0.008 * sin(x * 11.0 + 0.4);
  return 0.195 + pinos + sawmill + frazier + tecuya + crags;
}

float ridgeMid(float x) {
  float shoulderL = 0.095 * exp(-pow((x + 0.52) * 2.2, 2.0));
  float shoulderR = 0.105 * exp(-pow((x - 0.54) * 2.1, 2.0));
  float saddleDip = -0.024 * exp(-pow((x - 0.02) * 3.2, 2.0));
  float detail = 0.018 * (fbm(vec2(x * 7.2, 6.4)) - 0.48) + 0.007 * (fbm(vec2(x * 19.0, 9.1)) - 0.5);
  return 0.148 + shoulderL + shoulderR + saddleDip + detail;
}

float ridgeNear(float x) {
  float flankL = 0.068 * exp(-pow((x + 0.72) * 1.9, 2.0));
  float flankR = 0.074 * exp(-pow((x - 0.74) * 1.85, 2.0));
  float pines = 0.007 * sin(x * 38.0) * 0.5 + 0.004 * noise(vec2(x * 64.0, 11.4));
  return 0.072 + flankL + flankR + pines;
}

/* Crisp pinpoint starfield layer */
vec3 starLayer(vec2 uv, float scale, float seed, float time) {
  vec2 gv = uv * scale;
  vec2 id = floor(gv);
  vec2 f = fract(gv) - 0.5;
  vec2 rnd = hash22(id + seed);
  float exists = step(0.84, rnd.x);
  vec2 offset = (rnd - 0.5) * 0.72;
  float d = length(f - offset);
  float size = mix(0.016, 0.052, fract(rnd.y * 13.7));
  float core = smoothstep(size, 0.0, d);
  float twinkle = 0.68 + 0.32 * sin(time * (1.2 + rnd.x * 2.8) + rnd.y * TAU);
  /* Cool pearl, ice-cyan, and subtle warm star temperatures */
  vec3 tint = mix(vec3(0.76, 0.88, 1.0), vec3(1.0, 0.94, 0.86), step(0.72, fract(rnd.x * 29.1)));
  return tint * core * core * exists * twinkle;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / max(1.0, uRes.y);
  float minDim = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / minDim;

  /* Portrait vs landscape vertical focal alignment */
  float portrait = smoothstep(1.05, 0.65, aspect);
  vec2 corePos = vec2(0.0, mix(0.085, 0.115, portrait)) + uPointer * vec2(0.012, -0.008);
  vec2 dCore = p - corePos;
  float rCore = length(dCore);
  float angCore = atan(dCore.y, dCore.x);

  /* Master choreography envelopes */
  float t = max(0.0, uTime);
  float pIgnite = easeOutCubic(t / 0.75);                       /* 0.0 -> 0.75s: spark wakes */
  float pBloom  = easeInOutCubic((t - 0.45) / 1.15);            /* 0.45 -> 1.60s: volumetric bloom + rings */
  float pSettle = easeInOutCubic((t - 1.75) / 1.05);            /* 1.75 -> 2.80s: calm hearth equilibrium */
  float breathe = 0.5 + 0.5 * sin(t * 1.65);

  /* Peak intensity swells at t~1.55s then settles gracefully */
  float flarePeak = mix(0.65 * pIgnite, 1.0, pBloom) * mix(1.0, 0.76 + 0.05 * breathe, pSettle);
  float ringVis = easeOutCubic((t - 0.62) / 1.10);
  float outerVis = easeOutCubic((t - 0.92) / 1.15);

  /* 1. Deep Obsidian-Indigo Sky Base (#04060e -> #080d1c -> subtle #101930 horizon) */
  vec3 colZenith  = vec3(0.0157, 0.0235, 0.0549); /* #04060e */
  vec3 colMidSky  = vec3(0.0314, 0.0510, 0.1098); /* #080d1c */
  vec3 colHorizon = vec3(0.0627, 0.0980, 0.1882); /* #101930 */
  vec3 col = mix(colHorizon, colMidSky, smoothstep(0.12, 0.56, uv.y));
  col = mix(col, colZenith, smoothstep(0.48, 0.98, uv.y));

  /* Subtle high-altitude indigo/ice-cyan atmospheric nebula wisps */
  float neb1 = fbm(vec2(p.x * 2.1 + t * 0.018, p.y * 2.6 - t * 0.01));
  float neb2 = fbm(vec2(p.x * 3.8 - t * 0.014, p.y * 3.4 + 4.2));
  float nebMask = smoothstep(0.22, 0.78, uv.y) * smoothstep(0.98, 0.40, uv.y);
  col += vec3(0.09, 0.16, 0.28) * pow(neb1, 2.3) * 0.24 * nebMask;
  col += vec3(0.16, 0.14, 0.27) * pow(neb2, 2.8) * 0.14 * nebMask;

  /* 2. Crisp Multi-Depth Starfield */
  float starFade = smoothstep(0.15, 0.45, uv.y) * smoothstep(0.08, 0.34, rCore);
  vec2 starUV = (gl_FragCoord.xy / minDim) + uPointer * 0.008;
  vec3 stars = starLayer(starUV, 16.0, 1.7, t) * 0.95
             + starLayer(starUV + vec2(0.37, 0.19), 28.0, 9.3, t) * 0.65
             + starLayer(starUV + vec2(0.71, 0.63), 44.0, 21.1, t) * 0.38;
  col += stars * starFade * (0.45 + 0.55 * easeOutCubic(t / 1.2));

  /* 3. Volumetric Promethean Ember Core + Atmospheric Scattering */
  vec3 emberHot  = vec3(1.00, 0.96, 0.87); /* incandescent pearl-cream */
  vec3 emberGold = vec3(0.95, 0.72, 0.40); /* refined Promethean amber */
  vec3 emberDeep = vec3(0.72, 0.34, 0.14); /* deep hearth ember */
  vec3 iceCyan   = vec3(0.624, 0.831, 0.902); /* #9fd4e6 Prometheus cyan */
  vec3 lavender  = vec3(0.788, 0.722, 0.918); /* #c9b8ea Prometheus lavender */

  /* Volumetric swirling plasma corona around the core */
  float coronaNoise = fbm(vec2(angCore * 2.5 + t * 0.22, rCore * 7.5 - t * 0.38));
  float wideHalo = exp(-rCore * mix(5.8, 3.3, pBloom)) * (0.82 + 0.28 * coronaNoise);
  float midGlow  = exp(-rCore * mix(16.0, 9.8, pBloom));
  float hotCore  = exp(-rCore * mix(62.0, 34.0, pBloom));

  /* Subtle volumetric god-rays radiating from the hearth */
  float rayPattern = 0.5 + 0.5 * sin(angCore * 10.0 + t * 0.18) * cos(angCore * 6.0 - t * 0.12);
  float rays = pow(rayPattern, 2.2) * exp(-rCore * 4.4) * smoothstep(0.015, 0.08, rCore) * pBloom * (1.0 - 0.32 * pSettle);

  /* Anamorphic horizontal ignition flare (strongest at t=0.4s..1.4s, refined at settle) */
  float anamX = exp(-abs(dCore.x) * mix(9.0, 4.2, pBloom));
  float anamY = exp(-abs(dCore.y) * mix(130.0, 95.0, pBloom));
  float anamStrength = pIgnite * mix(1.0, 0.42, pSettle);
  vec3 anamFlare = mix(emberGold, emberHot, exp(-abs(dCore.x) * 14.0)) * anamX * anamY * 0.85 * anamStrength;

  /* Compose ember radiance */
  vec3 emberLight = emberDeep * wideHalo * 0.52 * flarePeak
                  + emberGold * midGlow * 0.88 * flarePeak
                  + emberHot  * hotCore * 1.45 * (0.45 + 0.55 * flarePeak)
                  + mix(emberGold, emberHot, 0.35) * rays * 0.22
                  + anamFlare;

  /* Cool obsidian-cyan halo rim balancing the warm ember (keeps it unmistakably Prometheus) */
  float coolAura = exp(-pow((rCore - 0.175) * 8.5, 2.0)) * 0.16 * ringVis;
  col += emberLight + mix(iceCyan, lavender, 0.35) * coolAura;

  /* 4. Precision Orbital Constellation Rings & Pillar Nodes */
  if (ringVis > 0.001) {
    float r1 = mix(0.075, 0.148, easeOutCubic((t - 0.55) / 1.15));
    float r2 = mix(0.115, 0.222, easeOutCubic((t - 0.82) / 1.25));
    float r3 = 0.295;

    /* Primary inner orbital ring (warm pearl-amber specular sweep) */
    float dR1 = abs(rCore - r1);
    float ring1 = smoothstep(0.0028, 0.0005, dR1);
    float ring1Glow = exp(-dR1 * 120.0) * 0.22;
    float arcSweep1 = 0.58 + 0.42 * cos(angCore - t * 0.55 + 0.7);
    col += mix(emberGold, emberHot, 0.55) * (ring1 * 0.72 + ring1Glow) * arcSweep1 * ringVis;

    /* Subtle graduated degree ticks around inner ring */
    float tickAng = fract((angCore + PI) / TAU * 36.0) - 0.5;
    float tickMask = smoothstep(0.08, 0.02, abs(tickAng)) * smoothstep(0.007, 0.001, abs(rCore - (r1 + 0.007)));
    col += vec3(0.88, 0.93, 1.0) * tickMask * 0.24 * ringVis;

    /* Secondary outer orbital ring (cool Prometheus ice-cyan & lavender) */
    float dR2 = abs(rCore - r2);
    float dash2 = smoothstep(-0.15, 0.25, sin(angCore * 3.0 + t * 0.22));
    float ring2 = smoothstep(0.0022, 0.0004, dR2) * (0.35 + 0.65 * dash2);
    float ring2Glow = exp(-dR2 * 135.0) * 0.14 * (0.4 + 0.6 * dash2);
    col += mix(iceCyan, lavender, 0.35 + 0.35 * sin(angCore * 2.0)) * (ring2 * 0.62 + ring2Glow) * outerVis;

    /* Faint outermost meridian arc */
    float dR3 = abs(rCore - r3);
    float arc3 = smoothstep(0.25, 0.85, abs(cos(angCore + 0.35)));
    col += iceCyan * smoothstep(0.0018, 0.0003, dR3) * 0.16 * arc3 * outerVis * (0.65 + 0.35 * pSettle);

    /* 8 Constellation Pillar Nodes orbiting r1 & r2 */
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float onOuter = mod(fi, 2.0);
      float rad = mix(r1, r2, onOuter);
      float speed = mix(0.20, -0.14, onOuter);
      float theta = fi * (TAU / 8.0) + 0.42 + t * speed;
      vec2 nodePos = corePos + vec2(cos(theta), sin(theta)) * rad;
      float nd = length(p - nodePos);
      float nodeCore = smoothstep(0.0068, 0.0012, nd);
      float nodeHalo = exp(-nd * 95.0) * 0.45;
      vec3 nodeCol = mix(emberHot, iceCyan, onOuter * 0.72);
      float nodeVis = mix(ringVis, outerVis, onOuter);
      col += nodeCol * (nodeCore + nodeHalo) * nodeVis;
    }
  }

  /* 5. Rising Promethean Ember Motes (organic drift upward from core) */
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float seed = fract(sin(fi * 78.233 + 11.4) * 43758.5453);
    float life = fract(t * (0.16 + seed * 0.12) + seed);
    float spread = (fract(sin(fi * 19.19) * 19384.2) - 0.5) * 0.42;
    float mx = corePos.x + spread * (0.35 + life * 0.9) + sin(t * 1.4 + fi * 2.1) * 0.018;
    float my = corePos.y - 0.06 + life * 0.36;
    float md = length(p - vec2(mx, my));
    float fade = sin(life * PI) * smoothstep(0.18, 0.65, t);
    float mote = exp(-md * 210.0) * fade * (0.55 + 0.45 * seed);
    vec3 moteCol = mix(emberGold, emberHot, seed * 0.7);
    col += moteCol * mote * 0.75;
  }

  /* 6. Frazier Park / Mount Pinos Layered Mountain Silhouettes + Warm Rim Lighting */
  float mx = (uv.x - 0.5) * mix(1.75, 1.15, portrait) + uPointer.x * 0.018;
  float hFar  = ridgeFar(mx)  + mix(0.02, 0.04, portrait);
  float hMid  = ridgeMid(mx * 1.06 + 0.04) + mix(0.005, -0.015, portrait);
  float hNear = ridgeNear(mx * 1.12 - 0.03);

  float aa = 1.6 / max(1.0, uRes.y);
  float emberHorizProx = exp(-pow((uv.x - 0.5) * 2.3, 2.0)) * flarePeak;

  /* Valley atmospheric mist behind far ridge */
  float mistBand = exp(-abs(uv.y - hFar) * 22.0) * (0.35 + 0.65 * emberHorizProx);
  col += mix(vec3(0.08, 0.13, 0.24), emberGold * 0.42, 0.42 * emberHorizProx) * mistBand * 0.52;

  /* Far ridge (Mount Pinos & Frazier Mountain) */
  float maskFar = smoothstep(hFar + aa, hFar - aa, uv.y);
  vec3 colFar = mix(vec3(0.036, 0.055, 0.112), vec3(0.020, 0.030, 0.068), smoothstep(hFar, hFar - 0.12, uv.y));
  float rimFar = exp(-abs(uv.y - hFar) * 290.0) * emberHorizProx;
  col = mix(col, colFar, maskFar);
  col += mix(emberGold, emberHot, 0.35) * rimFar * 0.55;

  /* Subtle mist nestled between far & mid ridges */
  float valleyMist = exp(-abs(uv.y - hMid) * 28.0) * maskFar;
  col += mix(vec3(0.07, 0.11, 0.20), emberGold * 0.32, 0.30 * emberHorizProx) * valleyMist * 0.38;

  /* Mid ridge */
  float maskMid = smoothstep(hMid + aa, hMid - aa, uv.y);
  vec3 colMid = mix(vec3(0.024, 0.036, 0.074), vec3(0.014, 0.020, 0.044), smoothstep(hMid, 0.0, uv.y));
  float rimMid = exp(-abs(uv.y - hMid) * 290.0) * emberHorizProx * mix(0.32, 0.16, portrait);
  col = mix(col, colMid, maskMid);
  col += mix(emberGold, iceCyan, 0.35) * rimMid * 0.36;

  /* Foreground obsidian pine-line ridge */
  float maskNear = smoothstep(hNear + aa, hNear - aa, uv.y);
  vec3 colNear = vec3(0.013, 0.018, 0.036);
  col = mix(col, colNear, maskNear);

  /* 7. Cinematic Vignette, Subtle ACES-like Filmic Tonemap & Anti-Banding Dither */
  float vig = smoothstep(1.32, 0.28, length((uv - 0.5) * vec2(aspect * 0.72, 1.08)));
  col *= mix(0.62, 1.0, vig);

  /* Filmic highlight roll-off (preserves warm ember core without harsh clipping) */
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(max(col, 0.0), vec3(0.96));

  /* Smooth fade-in from obsidian black (0..0.18s) and dismiss fade */
  float fadeIn = easeOutCubic(t / 0.22);
  col *= fadeIn * (1.0 - uDismiss * 0.35);

  /* Anti-banding hash dither */
  col += (hash12(gl_FragCoord.xy + fract(t) * 61.0) - 0.5) * (1.6 / 255.0);

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/* -------------------------------------------------------------------------- */
/*  Canvas2D Fallback Renderer (Visual Parity when WebGL2 is Unavailable)     */
/* -------------------------------------------------------------------------- */

function createCanvas2DRenderer(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) return null;

  /* Deterministic starfield & motes */
  const stars = Array.from({ length: 110 }, (_, i) => {
    const s1 = Math.sin(i * 127.1 + 31.7) * 43758.5453;
    const s2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const s3 = Math.sin(i * 419.2 + 71.1) * 43758.5453;
    return {
      x: s1 - Math.floor(s1),
      y: (s2 - Math.floor(s2)) * 0.78,
      r: 0.55 + (s3 - Math.floor(s3)) * 1.25,
      phase: (s1 - Math.floor(s1)) * Math.PI * 2,
      warm: (s3 - Math.floor(s3)) > 0.75,
    };
  });

  const motes = Array.from({ length: 14 }, (_, i) => {
    const s = Math.sin(i * 78.233 + 11.4) * 43758.5453;
    const seed = s - Math.floor(s);
    const sp = Math.sin(i * 19.19) * 19384.2;
    return { seed, spread: ((sp - Math.floor(sp)) - 0.5) * 0.42, idx: i };
  });

  const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const easeInOut = (x) => {
    const t = Math.max(0, Math.min(1, x));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  function ridgeHeight(x, layer) {
    if (layer === 0) {
      return (
        0.195 +
        0.145 * Math.exp(-Math.pow((x + 0.3) * 2.15, 2)) +
        0.088 * Math.exp(-Math.pow((x + 0.68) * 3.1, 2)) +
        0.125 * Math.exp(-Math.pow((x - 0.36) * 2.55, 2)) +
        0.072 * Math.exp(-Math.pow((x - 0.78) * 3.2, 2)) +
        0.014 * Math.sin(x * 9.5 + 0.4) +
        0.008 * Math.sin(x * 21.0 - 1.1)
      );
    }
    if (layer === 1) {
      return (
        0.148 +
        0.095 * Math.exp(-Math.pow((x + 0.52) * 2.2, 2)) +
        0.105 * Math.exp(-Math.pow((x - 0.54) * 2.1, 2)) -
        0.024 * Math.exp(-Math.pow((x - 0.02) * 3.2, 2)) +
        0.011 * Math.sin(x * 12.0 - 0.8)
      );
    }
    return (
      0.072 +
      0.068 * Math.exp(-Math.pow((x + 0.72) * 1.9, 2)) +
      0.074 * Math.exp(-Math.pow((x - 0.74) * 1.85, 2)) +
      0.005 * Math.sin(x * 38.0)
    );
  }

  function render(t, dismiss, px, py) {
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const minDim = Math.min(w, h);
    const portrait = w < h ? 1 : 0;

    const pIgnite = easeOut(t / 0.75);
    const pBloom = easeInOut((t - 0.45) / 1.15);
    const pSettle = easeInOut((t - 1.75) / 1.05);
    const ringVis = easeOut((t - 0.62) / 1.1);
    const outerVis = easeOut((t - 0.92) / 1.15);
    const flare = (0.65 * pIgnite + (1 - 0.65 * pIgnite) * pBloom) * (1 - 0.22 * pSettle);

    /* Sky gradient */
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#04060e");
    sky.addColorStop(0.55, "#080d1c");
    sky.addColorStop(1, "#101930");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    /* Stars */
    const starAlpha = 0.4 + 0.55 * easeOut(t / 1.2);
    for (const s of stars) {
      const tw = 0.65 + 0.35 * Math.sin(t * 2.1 + s.phase);
      ctx.fillStyle = s.warm
        ? `rgba(255,240,218,${(0.75 * tw * starAlpha).toFixed(3)})`
        : `rgba(205,228,248,${(0.75 * tw * starAlpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x * w + px * 6, s.y * h + py * 4, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Core center */
    const cx = w * 0.5 + px * minDim * 0.012;
    const cy = h * (portrait ? 0.385 : 0.415) + py * minDim * 0.008;

    /* Volumetric Ember Glow */
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glowR = minDim * (0.24 + 0.19 * pBloom);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, `rgba(255,246,224,${(0.95 * flare).toFixed(3)})`);
    g.addColorStop(0.14, `rgba(245,186,104,${(0.72 * flare).toFixed(3)})`);
    g.addColorStop(0.42, `rgba(184,88,36,${(0.28 * flare).toFixed(3)})`);
    g.addColorStop(0.75, `rgba(159,212,230,${(0.08 * ringVis).toFixed(3)})`);
    g.addColorStop(1, "rgba(4,6,14,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* Anamorphic flare */
    const anamW = minDim * (0.28 + 0.32 * pBloom);
    const anamA = pIgnite * (1 - 0.55 * pSettle) * 0.72;
    const ag = ctx.createLinearGradient(cx - anamW, cy, cx + anamW, cy);
    ag.addColorStop(0, "rgba(245,186,104,0)");
    ag.addColorStop(0.5, `rgba(255,242,216,${anamA.toFixed(3)})`);
    ag.addColorStop(1, "rgba(245,186,104,0)");
    ctx.fillStyle = ag;
    ctx.fillRect(cx - anamW, cy - Math.max(1.5, minDim * 0.003), anamW * 2, Math.max(3, minDim * 0.006));

    /* Orbital Constellation Rings */
    if (ringVis > 0.01) {
      const r1 = minDim * (0.075 + 0.073 * easeOut((t - 0.55) / 1.15));
      const r2 = minDim * (0.115 + 0.107 * easeOut((t - 0.82) / 1.25));

      ctx.strokeStyle = `rgba(245,196,124,${(0.58 * ringVis).toFixed(3)})`;
      ctx.lineWidth = Math.max(1.2, minDim * 0.0022);
      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(159,212,230,${(0.42 * outerVis).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, minDim * 0.0018);
      ctx.setLineDash([minDim * 0.05, minDim * 0.025]);
      ctx.beginPath();
      ctx.arc(cx, cy, r2, t * 0.12, t * 0.12 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 8; i++) {
        const onOuter = i % 2;
        const rad = onOuter ? r2 : r1;
        const speed = onOuter ? -0.14 : 0.2;
        const th = (i * Math.PI) / 4 + 0.42 + t * speed;
        const nx = cx + Math.cos(th) * rad;
        const ny = cy + Math.sin(th) * rad;
        const vis = onOuter ? outerVis : ringVis;
        ctx.fillStyle = onOuter
          ? `rgba(159,212,230,${(0.9 * vis).toFixed(3)})`
          : `rgba(255,240,214,${(0.95 * vis).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(nx, ny, Math.max(2, minDim * 0.0042), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* Rising Ember Motes */
    for (const m of motes) {
      const life = (t * (0.16 + m.seed * 0.12) + m.seed) % 1;
      const mx = cx + m.spread * minDim * (0.35 + life * 0.9) + Math.sin(t * 1.4 + m.idx * 2.1) * minDim * 0.018;
      const my = cy + minDim * 0.06 - life * minDim * 0.36;
      const fade = Math.sin(life * Math.PI) * Math.min(1, t / 0.65);
      ctx.fillStyle = `rgba(248,198,128,${(0.7 * fade).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(mx, my, Math.max(1.2, minDim * 0.0028), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    /* 3-Layer Mount Pinos Silhouettes */
    const layers = [
      { id: 0, fill: "#0a1020", rim: `rgba(245,186,104,${(0.45 * flare).toFixed(3)})`, lift: portrait ? 0.04 : 0.02 },
      { id: 1, fill: "#070b16", rim: `rgba(159,212,230,${(0.22 * flare).toFixed(3)})`, lift: portrait ? 0.02 : 0.01 },
      { id: 2, fill: "#04060e", rim: null, lift: 0 },
    ];
    for (const L of layers) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const nx = (u - 0.5) * (portrait ? 1.15 : 1.75) + px * 0.018;
        const yNorm = ridgeHeight(nx, L.id) + L.lift;
        ctx.lineTo(u * w, h * (1 - yNorm));
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = L.fill;
      ctx.fill();
      if (L.rim) {
        ctx.strokeStyle = L.rim;
        ctx.lineWidth = Math.max(1, minDim * 0.0018);
        ctx.stroke();
      }
    }

    if (dismiss > 0) {
      ctx.fillStyle = `rgba(4,6,14,${(dismiss * 0.4).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  return {
    type: "2d",
    render,
    resize() {},
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  WebGL2 Renderer                                                           */
/* -------------------------------------------------------------------------- */

function createWebGL2Renderer(canvas) {
  let gl = null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.useProgram(program);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uDismiss = gl.getUniformLocation(program, "uDismiss");
  const uPointer = gl.getUniformLocation(program, "uPointer");

  let disposed = false;

  return {
    type: "webgl2",
    resize() {
      if (disposed || gl.isContextLost()) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(t, dismiss, px, py) {
      if (disposed || gl.isContextLost()) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDismiss, dismiss);
      gl.uniform2f(uPointer, px, py);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      try {
        if (!gl.isContextLost()) {
          gl.bindVertexArray(null);
          gl.useProgram(null);
          if (vao) gl.deleteVertexArray(vao);
          gl.deleteProgram(program);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          const loseCtx = gl.getExtension("WEBGL_lose_context");
          if (loseCtx) loseCtx.loseContext();
        }
      } catch {
        /* ignore context teardown errors */
      }
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Injected Scoped CSS (Glassmorphic Typography & Reduced-Motion Support)    */
/* -------------------------------------------------------------------------- */

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.pm-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  background: #04060e;
  color: #f4f7fb;
  font-family: "Outfit", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  touch-action: manipulation;
  cursor: pointer;
  opacity: 1;
  transform: scale(1);
  will-change: opacity, transform;
}
.pm-splash-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.pm-splash-ui {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: max(28px, env(safe-area-inset-top, 28px)) 24px max(34px, env(safe-area-inset-bottom, 34px));
  box-sizing: border-box;
  pointer-events: none;
}
.pm-splash-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: clamp(46px, 11vh, 110px);
  opacity: 0;
  transform: translateY(14px) scale(0.985);
  will-change: opacity, transform;
}
.pm-splash-title {
  margin: 0;
  padding-left: 0.42em;
  font-weight: 200;
  font-size: clamp(26px, 4.6vw, 48px);
  letter-spacing: 0.42em;
  line-height: 1.1;
  color: #f4f7fb;
  text-shadow: 0 4px 32px rgba(4, 6, 14, 0.92), 0 0 28px rgba(245, 190, 114, 0.24);
}
.pm-splash-rule {
  width: clamp(92px, 18vw, 176px);
  height: 1px;
  margin: 14px 0 12px;
  background: linear-gradient(90deg, transparent, rgba(245, 194, 122, 0.72), rgba(159, 212, 230, 0.62), transparent);
  transform: scaleX(0);
  will-change: transform;
}
.pm-splash-sub {
  margin: 0;
  padding-left: 0.24em;
  font-weight: 400;
  font-size: clamp(10px, 1.4vw, 12px);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(214, 226, 245, 0.72);
  text-shadow: 0 2px 14px rgba(4, 6, 14, 0.9);
}
.pm-splash-hint {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(200, 220, 255, 0.16);
  background: rgba(8, 13, 28, 0.52);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12px 32px rgba(2, 4, 10, 0.48);
  color: rgba(226, 236, 250, 0.76);
  font-size: 10.5px;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  opacity: 0;
  transform: translateY(6px);
  transition: border-color 0.22s ease, color 0.22s ease;
}
.pm-splash-hint:hover,
.pm-splash-hint:focus-visible {
  border-color: rgba(245, 194, 122, 0.48);
  color: #f4f7fb;
  outline: none;
}
.pm-splash-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5be72;
  box-shadow: 0 0 10px rgba(245, 190, 114, 0.85);
}
@media (prefers-reduced-motion: reduce) {
  .pm-splash-brand { opacity: 1; transform: none; }
  .pm-splash-rule { transform: scaleX(1); }
  .pm-splash-hint { opacity: 0.88; transform: none; }
}
`;
  document.head.appendChild(style);
}

/* -------------------------------------------------------------------------- */
/*  Public Drop-In API: mountPrometheusSplash({ onComplete, skipIfSeen })     */
/* -------------------------------------------------------------------------- */

export function mountPrometheusSplash(options = {}) {
  const {
    onComplete = null,
    skipIfSeen = false,
    durationMs = 3400,
    autoDismiss = true,
    forceRenderer = "auto",
    reducedMotion = "auto",
    container = document.body,
    subtitle = "Every pillar · one fire",
  } = options;

  /* 1. Session skip check */
  if (skipIfSeen) {
    try {
      if (window.sessionStorage && window.sessionStorage.getItem(SESSION_KEY) === "1") {
        const result = { skipped: true, reason: "seen", renderer: "none", disposed: true };
        if (typeof onComplete === "function") queueMicrotask(() => onComplete(result));
        return {
          renderer: "none",
          dismiss() {},
          destroy() {},
          getState() { return { ...result, rafActive: false, frames: 0 }; },
        };
      }
    } catch {
      /* sessionStorage may be blocked in private contexts */
    }
  }

  ensureStyles();

  /* 2. Build overlay DOM */
  const root = document.createElement("div");
  root.className = "pm-splash";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Prometheus Hub intro");

  const canvas = document.createElement("canvas");
  canvas.className = "pm-splash-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const ui = document.createElement("div");
  ui.className = "pm-splash-ui";

  const brand = document.createElement("div");
  brand.className = "pm-splash-brand";

  const title = document.createElement("h1");
  title.className = "pm-splash-title";
  title.textContent = "PROMETHEUS";

  const rule = document.createElement("div");
  rule.className = "pm-splash-rule";

  const sub = document.createElement("p");
  sub.className = "pm-splash-sub";
  sub.textContent = subtitle;

  brand.append(title, rule, sub);

  const hint = document.createElement("button");
  hint.type = "button";
  hint.className = "pm-splash-hint";
  hint.innerHTML = `<span class="pm-splash-dot" aria-hidden="true"></span><span>Enter Hub</span>`;

  ui.append(brand, hint);
  root.append(canvas, ui);
  (container || document.body).appendChild(root);

  /* 3. Initialize renderer (WebGL2 primary, Canvas2D fallback) */
  let renderer = null;
  if (forceRenderer !== "2d") {
    renderer = createWebGL2Renderer(canvas);
  }
  if (!renderer) {
    renderer = createCanvas2DRenderer(canvas);
  }

  const isReduced =
    reducedMotion === true ||
    (reducedMotion === "auto" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* Cap DPR at 1.5 for crisp 60fps across mobile & high-DPI desktops */
  function resize() {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(window.innerWidth * dpr));
    const h = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      if (renderer) renderer.resize();
    }
  }
  resize();

  /* 4. State & Critically-Damped Spring Dismiss */
  const state = {
    renderer: renderer ? renderer.type : "none",
    reducedMotion: isReduced,
    rafId: 0,
    rafActive: false,
    disposed: false,
    glResourcesReleased: false,
    dismissing: false,
    dismissReason: null,
    dismissPos: 0,
    dismissStartMs: 0,
    frames: 0,
    elapsedSec: 0,
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    reducedTimer: 0,
  };

  let tStart = performance.now();
  let tLast = tStart;
  let completed = false;

  function applyTypography(tSec, dismissProg) {
    const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
    const brandIn = isReduced ? 1 : easeOut((tSec - 0.78) / 0.88);
    const ruleIn = isReduced ? 1 : easeOut((tSec - 0.95) / 0.75);
    const hintIn = isReduced ? 0.9 : easeOut((tSec - 1.35) / 0.65);

    const outFade = 1 - dismissProg;
    brand.style.opacity = (brandIn * outFade).toFixed(4);
    brand.style.transform = `translateY(${((1 - brandIn) * 14 - dismissProg * 8).toFixed(2)}px) scale(${(
      0.985 +
      brandIn * 0.015 +
      dismissProg * 0.02
    ).toFixed(4)})`;
    rule.style.transform = `scaleX(${ruleIn.toFixed(4)})`;
    hint.style.opacity = (hintIn * outFade).toFixed(4);
    hint.style.transform = `translateY(${((1 - hintIn) * 6).toFixed(2)}px)`;

    if (dismissProg > 0) {
      root.style.opacity = Math.max(0, 1 - dismissProg).toFixed(4);
      root.style.transform = `scale(${(1 + dismissProg * 0.032).toFixed(4)})`;
    }
  }

  /* 5. Strict Resource Disposal (ZERO background GPU/CPU cost after exit) */
  function destroy() {
    if (state.disposed) return;
    state.disposed = true;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
    state.rafActive = false;

    if (state.reducedTimer) {
      clearTimeout(state.reducedTimer);
      state.reducedTimer = 0;
    }

    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);

    if (renderer) {
      renderer.dispose();
      renderer = null;
      state.glResourcesReleased = true;
    }

    /* Reclaim backing store immediately */
    canvas.width = 0;
    canvas.height = 0;

    if (root.parentNode) {
      root.parentNode.removeChild(root);
    }

    try {
      if (window.sessionStorage) window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }

    if (!completed) {
      completed = true;
      if (typeof onComplete === "function") {
        onComplete({
          skipped: state.dismissReason !== "auto",
          reason: state.dismissReason || "complete",
          renderer: state.renderer,
          frames: state.frames,
          disposed: true,
        });
      }
    }
  }

  function dismiss(reason = "user") {
    if (state.disposed || state.dismissing) return;
    state.dismissing = true;
    state.dismissReason = reason;
    state.dismissStartMs = performance.now();
    root.style.pointerEvents = "none";

    if (isReduced) {
      /* Reduced motion: instant clean exit */
      destroy();
      return;
    }

    if (!state.rafActive) {
      tLast = performance.now();
      state.rafActive = true;
      state.rafId = requestAnimationFrame(tick);
    }
  }

  /* 6. Event Handlers */
  function onResize() {
    resize();
    if (isReduced && renderer && !state.disposed) {
      renderer.render(2.8, 0, 0, 0);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape" || e.key === " " || e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      dismiss("keyboard");
    }
  }

  function onPointerDown() {
    dismiss("pointer");
  }

  function onPointerMove(e) {
    state.tx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    state.ty = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  }

  function onVisibility() {
    if (!document.hidden && state.rafActive) {
      tLast = performance.now();
    }
  }

  function onContextLost(e) {
    e.preventDefault();
    if (state.disposed) return;
    if (renderer && renderer.type === "webgl2") {
      renderer.dispose();
      renderer = createCanvas2DRenderer(canvas);
      state.renderer = renderer ? "2d" : "none";
    }
  }

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  root.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);

  /* 7. Render Loop / Reduced-Motion Instant Static Reveal */
  function tick(now) {
    if (state.disposed) return;
    state.rafId = 0;

    const dt = Math.min(0.05, Math.max(0.001, (now - tLast) / 1000));
    tLast = now;

    if (!document.hidden) {
      state.elapsedSec = (now - tStart) / 1000;
      state.px += (state.tx - state.px) * Math.min(1, dt * 5);
      state.py += (state.ty - state.py) * Math.min(1, dt * 5);

      if (autoDismiss && !state.dismissing && state.elapsedSec * 1000 >= durationMs) {
        state.dismissing = true;
        state.dismissReason = "auto";
        state.dismissStartMs = now;
        root.style.pointerEvents = "none";
      }

      if (state.dismissing) {
        /* Exact closed-form critically-damped spring (zeta=1, omega=14.5 -> ~380ms frame-rate-independent exit) */
        const s = Math.max(0, (now - state.dismissStartMs) / 1000);
        const omega = 14.5;
        state.dismissPos = 1 - (1 + omega * s) * Math.exp(-omega * s);
        if (state.dismissPos >= 0.982 || s >= 0.45) {
          destroy();
          return;
        }
      }

      if (renderer) {
        renderer.render(state.elapsedSec, state.dismissPos, state.px, state.py);
      }
      applyTypography(state.elapsedSec, state.dismissPos);
      state.frames++;
    }

    if (!state.disposed) {
      state.rafActive = true;
      state.rafId = requestAnimationFrame(tick);
    }
  }

  /* Optional deterministic frame renderer for visual QA & screenshot capture */
  function renderAt(seconds, freeze = false) {
    if (state.disposed || !renderer) return;
    if (freeze && state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
      state.rafActive = false;
    }
    state.elapsedSec = seconds;
    renderer.render(seconds, 0, 0, 0);
    applyTypography(seconds, 0);
    state.frames++;
  }

  if (isReduced) {
    /* Instant static reveal at composed settle pose, zero rAF loop */
    renderAt(2.8);
    if (autoDismiss) {
      state.reducedTimer = window.setTimeout(() => destroy(), 1200);
    }
  } else {
    /* Draw first frame synchronously so there is zero blank flash */
    renderAt(0.0);
    state.rafActive = true;
    state.rafId = requestAnimationFrame(tick);
  }

  return {
    get renderer() {
      return state.renderer;
    },
    dismiss,
    destroy,
    renderAt,
    getState() {
      return {
        renderer: state.renderer,
        reducedMotion: state.reducedMotion,
        rafActive: state.rafActive,
        disposed: state.disposed,
        glResourcesReleased: state.glResourcesReleased,
        dismissing: state.dismissing,
        dismissReason: state.dismissReason,
        frames: state.frames,
        elapsedSec: Number(state.elapsedSec.toFixed(3)),
      };
    },
  };
}

export default mountPrometheusSplash;
