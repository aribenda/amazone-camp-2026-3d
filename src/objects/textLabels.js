import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import helvetikerFont from 'three/examples/fonts/helvetiker_regular.typeface.json';

const font = new FontLoader().parse(helvetikerFont);
const textMaterial = new THREE.MeshStandardMaterial({
  color: '#101820',
  emissive: '#f9f1dd',
  emissiveIntensity: 0.18,
  roughness: 0.58,
  metalness: 0.04,
});

const poleMaterial = new THREE.MeshStandardMaterial({
  color: '#f7f1e2',
  roughness: 0.72,
  metalness: 0.02,
});

export function createTextLabel(section) {
  const group = new THREE.Group();
  const text = section.label ?? section.name;
  group.name = `${section.id} ${text} label`;
  group.userData.rotatingLabel = true;

  const geometry = new TextGeometry(text, {
    font,
    size: text.length > 13 ? 0.16 : 0.2,
    depth: 0.025,
    curveSegments: 4,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.004,
    bevelSegments: 1,
  });
  geometry.computeBoundingBox();
  geometry.center();

  const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  const scale = Math.min(1, 2.45 / width);

  const front = new THREE.Mesh(geometry, textMaterial);
  front.castShadow = true;
  group.add(front);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.56, 10),
    poleMaterial,
  );
  pole.position.y = -0.38;
  pole.castShadow = true;
  group.add(pole);

  group.scale.setScalar(scale);
  return group;
}
