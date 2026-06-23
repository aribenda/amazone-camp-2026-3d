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
const keyboardTarget = new THREE.Vector2();
const moveForwardVec = new THREE.Vector3();
const moveRightVec = new THREE.Vector3();
let highlight = null;
let previousTime = performance.now();
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
syncMobileControls();
tryStartMusic();
animate();

function setupLights() {
  const hemisphere = new THREE.HemisphereLight('#fff8df', '#9f8e72', 2.4);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight('#fff4d0', 2.7);
  sun.position.set(-18, 32, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const shadowExtent = feet(Math.max(camp.widthFt, camp.depthFt) / 2 + 10);
  sun.shadow.camera.left = -shadowExtent;
  sun.shadow.camera.right = shadowExtent;
  sun.shadow.camera.top = shadowExtent;
  sun.shadow.camera.bottom = -shadowExtent;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);
}

function setupGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(feet(camp.widthFt + 100), feet(camp.depthFt + 100)),
    new THREE.MeshStandardMaterial({
      color: '#c9bfa8',
      roughness: 0.96,
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

function syncMobileControls() {
  mobileControls.classList.toggle('is-hidden', !usesTouchControls());
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
  if (!usesTouchControls()) {
    return;
  }

  joystickPointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
}

function handleLookStart(event) {
  if (!usesTouchControls() || event.pointerId === joystickPointerId) {
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
  syncMobileControls();
}

function moveWithTouch(deltaSeconds) {
  if (!usesTouchControls() || mobileMove.lengthSq() === 0) {
    return;
  }

  const speed = 13 * deltaSeconds;
  camera.getWorldDirection(moveForwardVec);
  moveForwardVec.y = 0;
  moveForwardVec.normalize();

  moveRightVec.crossVectors(moveForwardVec, camera.up).normalize();
  camera.position.addScaledVector(moveForwardVec, mobileMove.y * speed);
  camera.position.addScaledVector(moveRightVec, mobileMove.x * speed);
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
    keyboardTarget.set(xAxis, zAxis);

    if (keyboardTarget.lengthSq() > 1) {
      keyboardTarget.normalize();
    }

    keyboardTarget.multiplyScalar(MAX_KEYBOARD_SPEED);
    const rate = keyboardTarget.lengthSq() > 0 ? KEYBOARD_ACCELERATION : KEYBOARD_DECELERATION;
    keyboardVelocity.x = moveToward(keyboardVelocity.x, keyboardTarget.x, rate * deltaSeconds);
    keyboardVelocity.y = moveToward(keyboardVelocity.y, keyboardTarget.y, rate * deltaSeconds);

    if (Math.abs(keyboardVelocity.y) > 0.001) {
      controls.moveForward(keyboardVelocity.y * deltaSeconds);
    }
    if (Math.abs(keyboardVelocity.x) > 0.001) {
      controls.moveRight(keyboardVelocity.x * deltaSeconds);
    }
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
