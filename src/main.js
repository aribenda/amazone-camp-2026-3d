import './styles.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camp, feet, feetToWorld, referenceMap, sections } from './campLayout.js';
import { createCampSection } from './objects/builders.js';

const viewport = document.querySelector('#viewport');
const campMusic = document.querySelector('#campMusic');
const musicToggle = document.querySelector('#musicToggle');
const selectedId = document.querySelector('#selectedId');
const selectedName = document.querySelector('#selectedName');
const mobileControls = document.querySelector('#mobileControls');
const joystick = document.querySelector('#joystick');
const joystickKnob = document.querySelector('#joystickKnob');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d8d1bd');
scene.fog = new THREE.Fog('#d8d1bd', 18, 54);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, feet(6), -feet(112));
camera.rotation.y = Math.PI;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.append(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const labelTarget = new THREE.Vector3();
const clickableObjects = [];
const rotatingLabels = [];
const sectionGroups = new Map();
const cameraEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const mobileMove = new THREE.Vector2();
const keyboardVelocity = new THREE.Vector2();
let highlight = null;
let previousTime = performance.now();
let isAuthorized = true;
let joystickPointerId = null;
let lookPointerId = null;
let lookStart = null;
let lastLook = null;

const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const MOBILE_CONTROL_WIDTH = 760;
const MAX_KEYBOARD_SPEED = 18;
const KEYBOARD_ACCELERATION = 6;
const KEYBOARD_DECELERATION = 16;

setupLights();
setupGround();
setupReferenceMap();
setupCampBounds();
setupCampSections();
setupControls();
syncAccessUi();
tryStartMusic();
animate();

function setupLights() {
  const hemisphere = new THREE.HemisphereLight('#fff8df', '#9f8e72', 2.4);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight('#fff4d0', 2.7);
  sun.position.set(-18, 32, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);
}

function setupGround() {
  const playaTextures = createCrackedPlayaTextures();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(feet(camp.widthFt + 100), feet(camp.depthFt + 100)),
    new THREE.MeshStandardMaterial({
      color: '#d8d0ba',
      map: playaTextures.colorMap,
      bumpMap: playaTextures.bumpMap,
      bumpScale: 0.022,
      roughnessMap: playaTextures.roughnessMap,
      roughness: 0.98,
      metalness: 0,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(feet(camp.widthFt), 25, '#8f816a', '#b7ab95');
  grid.position.y = 0.018;
  scene.add(grid);
}

function createCrackedPlayaTextures() {
  const size = 768;
  const colorCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  bumpCanvas.width = size;
  bumpCanvas.height = size;

  const colorContext = colorCanvas.getContext('2d');
  const bumpContext = bumpCanvas.getContext('2d');
  const colorImage = colorContext.createImageData(size, size);
  const bumpImage = bumpContext.createImageData(size, size);
  const random = seededRandom(20260624);
  const cells = [];

  for (let index = 0; index < 120; index += 1) {
    cells.push({
      x: random() * size,
      y: random() * size,
      lift: random(),
      warm: random(),
    });
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let nearest = Infinity;
      let second = Infinity;
      let cell = cells[0];

      for (let index = 0; index < cells.length; index += 1) {
        const candidate = cells[index];
        const dxRaw = Math.abs(x - candidate.x);
        const dyRaw = Math.abs(y - candidate.y);
        const dx = Math.min(dxRaw, size - dxRaw);
        const dy = Math.min(dyRaw, size - dyRaw);
        const distance = dx * dx + dy * dy;

        if (distance < nearest) {
          second = nearest;
          nearest = distance;
          cell = candidate;
        } else if (distance < second) {
          second = distance;
        }
      }

      const crack = Math.sqrt(second) - Math.sqrt(nearest);
      const edge = smoothstep(5.4, 0.6, crack);
      const broadEdge = smoothstep(14, 3, crack);
      const grain = valueNoise(x, y);
      const fine = valueNoise(x * 3.7 + 17, y * 3.7 - 9);
      const plateLift = 0.58 + cell.lift * 0.18;
      const warm = cell.warm * 9;
      const shade = plateLift * 34 + grain * 13 + fine * 5 - edge * 58 - broadEdge * 12;
      const red = clamp(188 + shade + warm, 74, 224);
      const green = clamp(181 + shade + warm * 0.68, 72, 219);
      const blue = clamp(156 + shade * 0.88, 64, 204);
      const alpha = 255;
      const offset = (y * size + x) * 4;

      colorImage.data[offset] = red;
      colorImage.data[offset + 1] = green;
      colorImage.data[offset + 2] = blue;
      colorImage.data[offset + 3] = alpha;

      const height = clamp(178 + plateLift * 42 + grain * 18 - edge * 150 - broadEdge * 46, 18, 244);
      bumpImage.data[offset] = height;
      bumpImage.data[offset + 1] = height;
      bumpImage.data[offset + 2] = height;
      bumpImage.data[offset + 3] = alpha;
    }
  }

  colorContext.putImageData(colorImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);
  drawPlayaSurfaceDetail(colorContext, size);
  drawPlayaSurfaceDetail(bumpContext, size, true);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  const roughnessMap = new THREE.CanvasTexture(bumpCanvas);

  [colorMap, bumpMap, roughnessMap].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(170, 145);
    texture.anisotropy = 8;
  });
  colorMap.colorSpace = THREE.SRGBColorSpace;

  return { colorMap, bumpMap, roughnessMap };
}

function drawPlayaSurfaceDetail(context, size, bumpOnly = false) {
  const random = seededRandom(bumpOnly ? 90210 : 4242);
  context.save();
  context.globalAlpha = bumpOnly ? 0.18 : 0.16;
  context.strokeStyle = bumpOnly ? '#f7f7f7' : '#fff7dc';
  context.lineWidth = 1;
  for (let index = 0; index < 130; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const length = 10 + random() * 34;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(random() * Math.PI * 2) * length, y + Math.sin(random() * Math.PI * 2) * length);
    context.stroke();
  }

  context.globalAlpha = bumpOnly ? 0.22 : 0.2;
  context.fillStyle = bumpOnly ? '#444444' : '#6f6758';
  for (let index = 0; index < 4200; index += 1) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * size);
    const radius = random() > 0.95 ? 1.2 : 0.55;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function valueNoise(x, y) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setupReferenceMap() {
  const texture = new THREE.TextureLoader().load(referenceMap.imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(referenceMap.crop.width, referenceMap.crop.height);
  texture.offset.set(
    referenceMap.crop.x,
    1 - referenceMap.crop.y - referenceMap.crop.height,
  );

  const map = new THREE.Mesh(
    new THREE.PlaneGeometry(feet(camp.widthFt), feet(camp.depthFt)),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: referenceMap.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  map.name = 'Semi-transparent 2D reference map';
  map.rotation.x = -Math.PI / 2;
  map.position.y = 0.025;
  map.renderOrder = 1;
  scene.add(map);
}

function setupCampBounds() {
  const borderMaterial = new THREE.LineBasicMaterial({ color: '#101820', transparent: true, opacity: 0.65 });
  const halfWidth = feet(camp.widthFt / 2);
  const halfDepth = feet(camp.depthFt / 2);
  const points = [
    new THREE.Vector3(-halfWidth, 0.06, -halfDepth),
    new THREE.Vector3(halfWidth, 0.06, -halfDepth),
    new THREE.Vector3(halfWidth, 0.06, halfDepth),
    new THREE.Vector3(-halfWidth, 0.06, halfDepth),
    new THREE.Vector3(-halfWidth, 0.06, -halfDepth),
  ];
  const border = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), borderMaterial);
  scene.add(border);
}

function setupCampSections() {
  sections.forEach((section) => {
    const group = createCampSection(section);
    sectionGroups.set(section.id, group);
    scene.add(group);
    group.traverse((child) => {
      if (child.userData.rotatingLabel) {
        rotatingLabels.push(child);
      }
      if (child.isMesh || child.isSprite) {
        clickableObjects.push(child);
        child.castShadow = child.isMesh;
        child.receiveShadow = child.isMesh;
      }
    });
  });
}

function setupControls() {
  musicToggle.addEventListener('click', toggleMusic);
  window.addEventListener('pointerdown', startMusicFromGesture, { once: true });
  window.addEventListener('keydown', startMusicFromGesture, { once: true });

  controls.addEventListener('lock', () => {
    document.body.classList.add('is-looking');
  });

  controls.addEventListener('unlock', () => {
    keyboardVelocity.set(0, 0);
    document.body.classList.remove('is-looking');
  });

  window.addEventListener('keydown', (event) => updateMovement(event.code, true));
  window.addEventListener('keyup', (event) => updateMovement(event.code, false));
  renderer.domElement.addEventListener('click', handleClick);
  renderer.domElement.addEventListener('pointerdown', handleLookStart);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerEnd);
  window.addEventListener('pointercancel', handlePointerEnd);
  joystick.addEventListener('pointerdown', handleJoystickStart);
  window.addEventListener('resize', handleResize);
}

function startMusicFromGesture() {
  if (campMusic.paused) {
    tryStartMusic();
  }
}

function syncAccessUi() {
  mobileControls.classList.toggle('is-hidden', !isAuthorized || !usesTouchControls());
  document.body.classList.toggle('is-authorized', isAuthorized);
}

async function tryStartMusic() {
  try {
    await campMusic.play();
    updateMusicButton(true);
  } catch {
    updateMusicButton(false);
  }
}

async function toggleMusic() {
  if (campMusic.paused) {
    try {
      await campMusic.play();
      updateMusicButton(true);
    } catch {
      updateMusicButton(false);
    }
    return;
  }

  campMusic.pause();
  updateMusicButton(false);
}

function updateMusicButton(isPlaying) {
  musicToggle.textContent = isPlaying ? 'Pause music' : 'Play music';
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
}

function updateMovement(code, isPressed) {
  if (code === 'KeyW' || code === 'ArrowUp') movement.forward = isPressed;
  if (code === 'KeyS' || code === 'ArrowDown') movement.backward = isPressed;
  if (code === 'KeyA' || code === 'ArrowLeft') movement.left = isPressed;
  if (code === 'KeyD' || code === 'ArrowRight') movement.right = isPressed;
}

function handleClick(event) {
  if (!isAuthorized) {
    return;
  }

  if (!usesTouchControls() && !controls.isLocked) {
    controls.lock();
    return;
  }

  if (controls.isLocked) {
    pointer.set(0, 0);
  } else {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObjects(clickableObjects, false).find((item) => item.object.userData.section);
  if (!hit) {
    return;
  }

  selectSection(hit.object.userData.section);
}

function selectSection(section) {
  selectedId.textContent = section.id;
  selectedName.textContent = section.name;

  if (highlight) {
    scene.remove(highlight);
    highlight.geometry.dispose();
    highlight.material.dispose();
  }

  const group = sectionGroups.get(section.id);
  highlight = new THREE.BoxHelper(group, '#ffd166');
  highlight.name = `Highlight ${section.id}`;
  scene.add(highlight);
}

function handleJoystickStart(event) {
  if (!isAuthorized || !usesTouchControls()) {
    return;
  }

  joystickPointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
}

function handleLookStart(event) {
  if (!isAuthorized || !usesTouchControls() || event.pointerId === joystickPointerId) {
    return;
  }

  lookPointerId = event.pointerId;
  lookStart = { x: event.clientX, y: event.clientY };
  lastLook = { x: event.clientX, y: event.clientY };
  renderer.domElement.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (event.pointerId === joystickPointerId) {
    updateJoystick(event);
    return;
  }

  if (event.pointerId !== lookPointerId || !lastLook) {
    return;
  }

  rotateCamera(event.clientX - lastLook.x, event.clientY - lastLook.y);
  lastLook = { x: event.clientX, y: event.clientY };
}

function handlePointerEnd(event) {
  if (event.pointerId === joystickPointerId) {
    joystickPointerId = null;
    mobileMove.set(0, 0);
    joystickKnob.style.transform = 'translate(-50%, -50%)';
  }

  if (event.pointerId === lookPointerId) {
    lookPointerId = null;
    lastLook = null;
    lookStart = null;
  }
}

function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const radius = rect.width / 2;
  const centerX = rect.left + radius;
  const centerY = rect.top + radius;
  const deltaX = event.clientX - centerX;
  const deltaY = event.clientY - centerY;
  const distance = Math.min(Math.hypot(deltaX, deltaY), radius);
  const angle = Math.atan2(deltaY, deltaX);
  const knobX = Math.cos(angle) * distance;
  const knobY = Math.sin(angle) * distance;

  joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  mobileMove.set(knobX / radius, -knobY / radius);
}

function rotateCamera(deltaX, deltaY) {
  cameraEuler.setFromQuaternion(camera.quaternion);
  cameraEuler.y -= deltaX * 0.004;
  cameraEuler.x -= deltaY * 0.004;
  cameraEuler.x = THREE.MathUtils.clamp(cameraEuler.x, -Math.PI / 2.4, Math.PI / 2.4);
  camera.quaternion.setFromEuler(cameraEuler);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  syncAccessUi();
}

function moveWithTouch(deltaSeconds) {
  if (!isAuthorized || !usesTouchControls() || mobileMove.lengthSq() === 0) {
    return;
  }

  const speed = 13 * deltaSeconds;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  camera.position.addScaledVector(forward, mobileMove.y * speed);
  camera.position.addScaledVector(right, mobileMove.x * speed);
}

function usesTouchControls() {
  return isTouchDevice || window.innerWidth <= MOBILE_CONTROL_WIDTH;
}

function clampCameraToCamp() {
  camera.position.y = feet(6);
  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    -feet(camp.widthFt / 2 + 12),
    feet(camp.widthFt / 2 + 12),
  );
  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    -feet(camp.depthFt / 2 + 12),
    feet(camp.depthFt / 2 + 12),
  );
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;

  if (controls.isLocked) {
    const xAxis = Number(movement.right) - Number(movement.left);
    const zAxis = Number(movement.forward) - Number(movement.backward);
    const target = new THREE.Vector2(xAxis, zAxis);

    if (target.lengthSq() > 1) {
      target.normalize();
    }

    target.multiplyScalar(MAX_KEYBOARD_SPEED);
    const rate = target.lengthSq() > 0 ? KEYBOARD_ACCELERATION : KEYBOARD_DECELERATION;
    keyboardVelocity.x = moveToward(keyboardVelocity.x, target.x, rate * deltaSeconds);
    keyboardVelocity.y = moveToward(keyboardVelocity.y, target.y, rate * deltaSeconds);

    if (Math.abs(keyboardVelocity.y) > 0.001) {
      controls.moveForward(keyboardVelocity.y * deltaSeconds);
    }
    if (Math.abs(keyboardVelocity.x) > 0.001) {
      controls.moveRight(keyboardVelocity.x * deltaSeconds);
    }

    clampCameraToCamp();
  }

  moveWithTouch(deltaSeconds);
  clampCameraToCamp();

  rotatingLabels.forEach((label, index) => {
    labelTarget.set(camera.position.x, label.position.y, camera.position.z);
    label.lookAt(labelTarget);
    label.rotateY(Math.sin(now * 0.001 + index) * 0.18);
  });

  if (highlight) {
    highlight.update();
  }

  renderer.render(scene, camera);
}

function moveToward(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}
