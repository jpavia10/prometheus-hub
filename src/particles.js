import * as THREE from "three";
import {
  simulationVert,
  simulationFrag,
  pointsVert,
  pointsFrag,
  starVert,
  starFrag
} from "./shaders.js";

function gauss() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
}

function makeTexture(size, fill) {
  const data = new Float32Array(size * size * 4);
  const count = size * size;
  for (let i = 0; i < count; i++) {
    const p = fill(i, count);
    data[i * 4] = p[0];
    data[i * 4 + 1] = p[1];
    data[i * 4 + 2] = p[2];
    data[i * 4 + 3] = 1;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = false;
  if ("colorSpace" in texture && THREE.NoColorSpace) texture.colorSpace = THREE.NoColorSpace;
  else if ("colorSpace" in texture) texture.colorSpace = THREE.LinearSRGBColorSpace;
  return texture;
}

function nebula() {
  const core = Math.random() < 0.58;
  const scale = core ? 0.22 + Math.random() * 0.2 : 0.75 + Math.random() * 0.7;
  return [gauss() * scale * 1.15, gauss() * scale * 0.78, gauss() * scale * 0.42];
}

function twin() {
  const which = Math.random() < 0.5 ? -1 : 1;
  if (Math.random() < 0.08) return [gauss() * 0.16, gauss() * 0.1, gauss() * 0.05];
  const u = Math.random() * Math.PI * 2;
  const radius = 0.46 + (Math.random() - 0.5) * 0.045;
  const x = which * 0.62 + Math.cos(u) * radius;
  const y = Math.sin(u) * radius * 1.05;
  const z = (Math.random() - 0.5) * 0.08;
  return [x, y, z];
}

function atlas() {
  const centers = [
    [-1.2, 0.28, 0.04],
    [0.02, -0.38, 0.0],
    [1.18, 0.34, -0.06]
  ];
  const center = centers[Math.floor(Math.random() * centers.length)];
  const spread = 0.2 + Math.random() * 0.06;
  return [
    center[0] + gauss() * spread,
    center[1] + gauss() * spread * 0.82,
    center[2] + gauss() * spread
  ];
}

function arc() {
  if (Math.random() < 0.16) return [(Math.random() - 0.5) * 2.35, -0.22, gauss() * 0.03];
  const t = Math.random();
  const ang = Math.PI * (1 - t);
  return [Math.cos(ang) * 1.2, Math.sin(ang) * 0.78 - 0.08, gauss() * 0.04];
}

function ring() {
  const major = 1.05;
  const tube = 0.16 + Math.random() * 0.05;
  const u = Math.random() * Math.PI * 2;
  const v = Math.random() * Math.PI * 2;
  const radius = major + Math.cos(v) * tube;
  const x = Math.cos(u) * radius;
  const y = Math.sin(v) * tube * 1.4;
  const z = Math.sin(u) * radius;
  const tilt = 0.72;
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return [x, y * c - z * s, y * s + z * c];
}

function coin() {
  const rim = Math.random() < 0.42;
  const angle = Math.random() * Math.PI * 2;
  const radius = rim ? 0.92 + Math.random() * 0.07 : Math.pow(Math.random(), 0.55) * 0.86;
  return [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.96,
    (Math.random() - 0.5) * (rim ? 0.08 : 0.03)
  ];
}

function along(a, b, jitter) {
  const t = Math.random();
  return [
    a[0] + (b[0] - a[0]) * t + gauss() * jitter,
    a[1] + (b[1] - a[1]) * t + gauss() * jitter,
    a[2] + (b[2] - a[2]) * t + gauss() * jitter
  ];
}

function hearth() {
  const edges = [
    [[-0.95, -0.42, -0.5], [0.95, -0.42, -0.5]],
    [[0.95, -0.42, -0.5], [0.95, -0.42, 0.5]],
    [[0.95, -0.42, 0.5], [-0.95, -0.42, 0.5]],
    [[-0.95, -0.42, 0.5], [-0.95, -0.42, -0.5]],
    [[-0.95, -0.42, -0.5], [-0.95, 0.22, -0.5]],
    [[0.95, -0.42, -0.5], [0.95, 0.22, -0.5]],
    [[0.95, -0.42, 0.5], [0.95, 0.22, 0.5]],
    [[-0.95, -0.42, 0.5], [-0.95, 0.22, 0.5]],
    [[-0.95, 0.22, -0.5], [0.95, 0.22, -0.5]],
    [[0.95, 0.22, -0.5], [0.95, 0.22, 0.5]],
    [[0.95, 0.22, 0.5], [-0.95, 0.22, 0.5]],
    [[-0.95, 0.22, 0.5], [-0.95, 0.22, -0.5]],
    [[-0.95, 0.22, -0.5], [0, 0.78, -0.5]],
    [[0.95, 0.22, -0.5], [0, 0.78, -0.5]],
    [[-0.95, 0.22, 0.5], [0, 0.78, 0.5]],
    [[0.95, 0.22, 0.5], [0, 0.78, 0.5]],
    [[0, 0.78, -0.5], [0, 0.78, 0.5]],
    [[0, 0.22, -0.5], [0, 0.22, 0.5]],
    [[-0.95, 0.22, 0], [0.95, 0.22, 0]]
  ];
  const edge = edges[Math.floor(Math.random() * edges.length)];
  return along(edge[0], edge[1], 0.012);
}

function temple() {
  const count = 10;
  const index = Math.floor(Math.random() * count);
  const angle = (index / count) * Math.PI * 2;
  const x = Math.cos(angle) * 0.78;
  const z = Math.sin(angle) * 0.4;
  if (Math.random() < 0.18) return [x, 0.58, z];
  return [x + gauss() * 0.015, -0.32 + Math.random() * 0.9, z + gauss() * 0.015];
}

function route() {
  const t = Math.random();
  const x = -1.25 + t * 2.5;
  const y = Math.sin(t * Math.PI * 2.0) * 0.38;
  return [x, y, gauss() * 0.025];
}

function ascent() {
  const t = Math.random();
  const x = -1.15 + t * 2.25;
  const y = -0.8 + Math.pow(t, 1.75) * 1.85;
  return [x + gauss() * 0.02, y + gauss() * 0.018, gauss() * 0.03];
}

function aperture() {
  if (Math.random() < 0.14) {
    const spoke = (Math.PI * 2 / 6) * Math.floor(Math.random() * 6);
    const radius = Math.random() * 0.9;
    return [Math.cos(spoke) * radius, Math.sin(spoke) * radius * 0.92, 0];
  }
  const rings = [0.28, 0.54, 0.84];
  const radius = rings[Math.floor(Math.random() * rings.length)];
  const angle = Math.random() * Math.PI * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.92, gauss() * 0.018];
}

function folder() {
  const body = [
    [[-0.9, -0.48, 0], [0.9, -0.48, 0]],
    [[0.9, -0.48, 0], [0.9, 0.38, 0]],
    [[0.9, 0.38, 0], [-0.9, 0.38, 0]],
    [[-0.9, 0.38, 0], [-0.9, -0.48, 0]],
    [[-0.9, 0.38, 0], [-0.9, 0.62, 0]],
    [[-0.9, 0.62, 0], [-0.15, 0.62, 0]],
    [[-0.15, 0.62, 0], [-0.15, 0.38, 0]]
  ];
  if (Math.random() < 0.28) {
    return [(Math.random() - 0.5) * 1.65, (Math.random() - 0.5) * 0.7 - 0.05, gauss() * 0.02];
  }
  const edge = body[Math.floor(Math.random() * body.length)];
  return along(edge[0], edge[1], 0.01);
}

export function startField(canvas) {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const size = coarse ? 128 : 168;
  const locked = canvas.dataset.lock || "";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x05070e, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 0.08, 4.45);
  camera.lookAt(0, 0.02, 0);

  const simScene = new THREE.Scene();
  const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  simCamera.position.z = 1;

  const shapes = {
    desk: makeTexture(size, nebula),
    sylade: makeTexture(size, twin),
    houses: makeTexture(size, atlas),
    seats: makeTexture(size, arc),
    titan: makeTexture(size, ring),
    midas: makeTexture(size, coin),
    hearth: makeTexture(size, hearth),
    apollo: makeTexture(size, temple),
    hermes: makeTexture(size, route),
    kairos: makeTexture(size, arc),
    icarus: makeTexture(size, ascent),
    argus: makeTexture(size, aperture),
    drive: makeTexture(size, folder)
  };

  const simUniforms = {
    uA: { value: shapes.desk },
    uB: { value: shapes.sylade },
    uC: { value: shapes.houses },
    uD: { value: shapes.seats },
    uFocus: { value: shapes.desk },
    uTime: { value: 0 },
    uScroll: { value: locked === "sylade" ? 0.333 : 0 },
    uFocusMix: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPull: { value: reduce ? 0 : 0.22 }
  };

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: simUniforms,
    vertexShader: simulationVert,
    fragmentShader: simulationFrag,
    depthTest: false,
    depthWrite: false
  });
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial));

  const target = new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false
  });
  target.texture.flipY = false;
  if (THREE.NoColorSpace) target.texture.colorSpace = THREE.NoColorSpace;
  else target.texture.colorSpace = THREE.LinearSRGBColorSpace;

  const positions = new Float32Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    positions[i * 3] = (i % size) / size;
    positions[i * 3 + 1] = Math.floor(i / size) / size;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const pointUniforms = {
    uPositions: { value: target.texture },
    uSize: { value: 5.4 },
    uResolution: { value: new THREE.Vector2(1, 1) }
  };
  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: pointUniforms,
    vertexShader: pointsVert,
    fragmentShader: pointsFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geometry, pointMaterial);
  scene.add(points);

  const starCount = coarse ? 80 : 150;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.2 + Math.random() * 5.4;
    starPositions[i * 3] = Math.cos(angle) * radius * (0.65 + Math.random() * 0.7);
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 5.4;
    starPositions[i * 3 + 2] = (Math.random() - 0.55) * 3.2;
    starSizes[i] = Math.random() < 0.1 ? 2.4 + Math.random() * 1.8 : 0.7 + Math.random() * 1.3;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
  const starUniforms = { uTime: { value: 0 } };
  const stars = new THREE.Points(
    starGeometry,
    new THREE.ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: starVert,
      fragmentShader: starFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(stars);

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  let scrollCurrent = locked === "sylade" ? 0.333 : 0;
  let shiftCurrent = 0;
  let focusMix = 0;
  let focusTarget = 0;
  const clock = new THREE.Clock();

  function onPointer(event) {
    const x = event.clientX / Math.max(1, window.innerWidth);
    const y = event.clientY / Math.max(1, window.innerHeight);
    pointerTarget.x = x * 2 - 1;
    pointerTarget.y = -(y * 2 - 1);
  }
  window.addEventListener("pointermove", onPointer, { passive: true });

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    pointUniforms.uResolution.value.set(width, height);
    pointUniforms.uSize.value = width < 720 ? 4.5 : 5.5;
  }
  window.addEventListener("resize", resize);
  resize();

  function sectionShift() {
    if (locked === "sylade") return window.innerWidth < 860 ? 0 : 0.55;
    if (window.innerWidth < 860) return 0;
    const panels = document.querySelectorAll(".panel");
    if (!panels.length) return 0;
    const y = window.scrollY + window.innerHeight * 0.42;
    let index = 0;
    panels.forEach(function (panel, i) {
      if (panel.offsetTop <= y) index = i;
    });
    if (index === 0) return 0.42;
    return 0.95;
  }

  let running = true;
  let looping = false;
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let reduceMotion = motionQuery ? motionQuery.matches : reduce;
  let settledFrames = 0;

  function queue() {
    if (!running || looping) return;
    if (reduceMotion && settledFrames >= 3) return;
    looping = true;
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      if (!reduceMotion) queue();
    }
  });
  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function () {
      reduceMotion = motionQuery.matches;
      simUniforms.uPull.value = reduceMotion ? 0 : 0.22;
      if (!reduceMotion) {
        settledFrames = 0;
        queue();
      }
    });
  }

  function frame() {
    looping = false;
    if (!running) return;

    const delta = Math.min(0.05, clock.getDelta());
    const elapsed = reduceMotion ? 0 : clock.elapsedTime;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollTarget = locked === "sylade" ? 0.333 : window.scrollY / maxScroll;
    const follow = reduceMotion ? 1 : 1 - Math.pow(0.001, delta);
    scrollCurrent += (scrollTarget - scrollCurrent) * (reduceMotion ? 1 : follow);
    focusMix += (focusTarget - focusMix) * (reduceMotion ? 1 : follow);
    pointer.x += (pointerTarget.x - pointer.x) * (reduceMotion ? 1 : 0.07);
    pointer.y += (pointerTarget.y - pointer.y) * (reduceMotion ? 1 : 0.07);

    simUniforms.uTime.value = elapsed;
    simUniforms.uScroll.value = scrollCurrent;
    simUniforms.uFocusMix.value = focusMix;
    simUniforms.uPointer.value.set(pointer.x, pointer.y);
    starUniforms.uTime.value = elapsed;

    const previous = renderer.outputColorSpace;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(simScene, simCamera);
    renderer.setRenderTarget(null);
    renderer.outputColorSpace = previous;

    const shiftGoal = sectionShift();
    shiftCurrent += (shiftGoal - shiftCurrent) * (reduceMotion ? 1 : 0.06);
    points.position.x = shiftCurrent;
    points.position.y = window.innerWidth < 720 ? 0.22 : 0.28;
    const idle = reduceMotion ? 0 : Math.sin(elapsed * 0.16) * 0.045;
    const camX = reduceMotion ? 0 : pointer.x * 0.2 + idle;
    const camY = reduceMotion ? 0.04 : 0.04 + pointer.y * 0.12 + Math.cos(elapsed * 0.12) * 0.028;
    camera.position.x += (camX - camera.position.x) * 0.08;
    camera.position.y += (camY - camera.position.y) * 0.08;
    camera.lookAt(shiftCurrent * 0.28, 0.02, 0);

    renderer.render(scene, camera);
    if (reduceMotion) settledFrames += 1;
    queue();
  }

  queue();

  return {
    setFocus(name) {
      if (name && shapes[name]) {
        simUniforms.uFocus.value = shapes[name];
        focusTarget = 1;
      } else {
        focusTarget = 0;
      }
      if (reduceMotion) {
        settledFrames = 0;
        queue();
      }
    },
    destroy() {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      running = false;
      geometry.dispose();
      pointMaterial.dispose();
      starGeometry.dispose();
      stars.material.dispose();
      simMaterial.dispose();
      target.dispose();
      Object.keys(shapes).forEach(function (key) { shapes[key].dispose(); });
      renderer.dispose();
    }
  };
}
