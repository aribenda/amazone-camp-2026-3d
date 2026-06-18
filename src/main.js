import './styles.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camp, feet, feetToWorld, referenceMap, sections } from './campLayout.js';
import { createCampSection } from './objects/builders.js';

const viewport = document.querySelector('#viewport');
const enterButton = document.querySelector('#enterButton');
const selectedId = document.querySelector('#selectedId');
const selectedName = document.querySelector('#selectedName');

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
const clickableObjects = [];
const sectionGroups = new Map();
let highlight = null;
let previousTime = performance.now();

const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

setupLights();
setupGround();
setupReferenceMap();
setupCampBounds();
setupCampSections();
setupControls();
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
      if (child.isMesh || child.isSprite) {
        clickableObjects.push(child);
        child.castShadow = child.isMesh;
        child.receiveShadow = child.isMesh;
      }
    });
  });
}

function setupControls() {
  enterButton.addEventListener('click', () => controls.lock());

  controls.addEventListener('lock', () => {
    enterButton.classList.add('is-hidden');
  });

  controls.addEventListener('unlock', () => {
    enterButton.classList.remove('is-hidden');
  });

  window.addEventListener('keydown', (event) => updateMovement(event.code, true));
  window.addEventListener('keyup', (event) => updateMovement(event.code, false));
  renderer.domElement.addEventListener('click', handleClick);
  window.addEventListener('resize', handleResize);
}

function updateMovement(code, isPressed) {
  if (code === 'KeyW' || code === 'ArrowUp') movement.forward = isPressed;
  if (code === 'KeyS' || code === 'ArrowDown') movement.backward = isPressed;
  if (code === 'KeyA' || code === 'ArrowLeft') movement.left = isPressed;
  if (code === 'KeyD' || code === 'ArrowRight') movement.right = isPressed;
}

function handleClick(event) {
  if (!controls.isLocked) {
    return;
  }

  pointer.set(0, 0);
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

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;

  if (controls.isLocked) {
    const speed = 18 * deltaSeconds;
    const xAxis = Number(movement.right) - Number(movement.left);
    const zAxis = Number(movement.forward) - Number(movement.backward);

    if (zAxis !== 0) {
      controls.moveForward(zAxis * speed);
    }
    if (xAxis !== 0) {
      controls.moveRight(xAxis * speed);
    }

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

  if (highlight) {
    highlight.update();
  }

  renderer.render(scene, camera);
}
