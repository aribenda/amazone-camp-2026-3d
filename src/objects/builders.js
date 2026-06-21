import * as THREE from 'three';
import { feet, feetToWorld } from '../campLayout.js';
import { createTextLabel } from './textLabels.js';

const defaultMaterialOptions = {
  roughness: 0.85,
  metalness: 0.02,
};

export function createCampSection(section) {
  const group = new THREE.Group();
  group.name = `${section.id} - ${section.name}`;
  group.userData.section = section;

  const builders = {
    portal: buildPortal,
    lounge: buildCanopy,
    bar: buildBar,
    booth: buildBox,
    dome: buildDome,
    art: buildArt,
    bikeParking: buildMultiFlat,
    trailer: buildVehicle,
    dining: buildCanopy,
    kitchen: buildBox,
    carport: buildCarport,
    shower: buildBox,
    generator: buildBox,
    toilets: buildToilets,
    fuel: buildFuelDepot,
    fireLane: buildFlatZone,
    tentCamping: buildTentCamping,
    bus: buildVehicle,
    rv: buildMultiVehicle,
    parking: buildParking,
    yurts: buildPods,
    shiftpods: buildPods,
  };

  builders[section.kind]?.(group, section);
  addLabel(group, section);
  markClickable(group, section);

  return group;
}

function buildPortal(group, section) {
  const material = materialFor(section.color);
  const postGeometry = new THREE.BoxGeometry(feet(3), feet(section.heightFt), feet(3));
  const beamGeometry = new THREE.BoxGeometry(feet(section.widthFt), feet(4), feet(3));
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const postOffset = feet(section.widthFt / 2 - 3);

  [-postOffset, postOffset].forEach((offset) => {
    const post = new THREE.Mesh(postGeometry, material);
    post.position.set(x + offset, feet(section.heightFt / 2), z);
    group.add(post);
  });

  const beam = new THREE.Mesh(beamGeometry, material);
  beam.position.set(x, feet(section.heightFt - 2), z);
  group.add(beam);

  addHitBox(group, section, feet(section.heightFt));
}

function buildCanopy(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(feet(section.widthFt), feet(1.6), feet(section.depthFt)),
    materialFor(section.color, 0.78),
  );
  roof.position.set(x, feet(section.heightFt), z);
  group.add(roof);

  const postGeometry = new THREE.CylinderGeometry(feet(0.6), feet(0.6), feet(section.heightFt), 8);
  const postMaterial = materialFor('#2f3e46', 0.88);
  const corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  corners.forEach(([xSign, zSign]) => {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(
      x + xSign * feet(section.widthFt / 2 - 2),
      feet(section.heightFt / 2),
      z + zSign * feet(section.depthFt / 2 - 2),
    );
    group.add(post);
  });

  addFloor(group, section, 0.18);
  addHitBox(group, section, feet(section.heightFt));
}

function buildBar(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(feet(section.widthFt), feet(section.heightFt), feet(section.depthFt)),
    materialFor(section.color, 0.9),
  );
  bar.position.set(x, feet(section.heightFt / 2), z);
  bar.rotation.y = THREE.MathUtils.degToRad(section.rotationDeg ?? 0);
  group.add(bar);
  addHitBox(group, section, feet(section.heightFt));
}

function buildBox(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(feet(section.widthFt), feet(section.heightFt), feet(section.depthFt)),
    materialFor(section.color),
  );
  mesh.position.set(x, feet(section.heightFt / 2), z);
  group.add(mesh);
}

function buildDome(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const radius = feet(section.radiusFt);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    materialFor(section.color, 0.58),
  );
  dome.scale.y = feet(section.heightFt) / radius;
  dome.position.set(x, 0, z);
  group.add(dome);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, feet(0.18), 8, 48),
    materialFor('#101820', 0.45),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, feet(0.25), z);
  group.add(ring);
}

function buildArt(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(feet(0.6), feet(0.8), feet(section.heightFt), 12),
    materialFor('#48535a'),
  );
  pole.position.set(x, feet(section.heightFt / 2), z);
  group.add(pole);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(feet(section.radiusFt), feet(0.25), 12, 48),
    materialFor(section.color, 0.82),
  );
  halo.position.set(x, feet(section.heightFt), z);
  halo.rotation.x = Math.PI / 2.7;
  group.add(halo);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(feet(section.radiusFt * 0.55), feet(section.radiusFt * 0.55), feet(1.5), 20),
    materialFor(section.color, 0.62),
  );
  base.position.set(x, feet(0.75), z);
  group.add(base);
}

function buildMultiFlat(group, section) {
  section.parts.forEach((part) => {
    addPartBox(group, section, part, feet(0.35), section.color, 0.52);
    addBikeRacks(group, section, part);
  });
}

function buildVehicle(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(feet(section.widthFt), feet(section.heightFt), feet(section.depthFt)),
    materialFor(section.color),
  );
  body.position.set(x, feet(section.heightFt / 2), z);
  group.add(body);

  const wheelGeometry = new THREE.CylinderGeometry(feet(1.4), feet(1.4), feet(0.8), 16);
  const wheelMaterial = materialFor('#182026');
  [-1, 1].forEach((zSign) => {
    [-0.35, 0.35].forEach((xOffset) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(
        x + xOffset * feet(section.widthFt),
        feet(1.5),
        z + zSign * feet(section.depthFt / 2 + 0.3),
      );
      group.add(wheel);
    });
  });
}

function buildCarport(group, section) {
  buildCanopy(group, section);

  if (!section.bays) {
    return;
  }

  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const bayWidth = feet(section.widthFt / section.bays);
  for (let index = 1; index < section.bays; index += 1) {
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(feet(0.35), feet(4), feet(section.depthFt)),
      materialFor('#60727b', 0.48),
    );
    divider.position.set(x - feet(section.widthFt / 2) + bayWidth * index, feet(2), z);
    group.add(divider);
  }
}

function buildToilets(group, section) {
  const stallCount = 3;
  const stallWidth = section.widthFt / stallCount;
  for (let index = 0; index < stallCount; index += 1) {
    const xFt = section.xFt - section.widthFt / 2 + stallWidth / 2 + stallWidth * index;
    addPartBox(
      group,
      section,
      { xFt, zFt: section.zFt, widthFt: stallWidth - 0.7, depthFt: section.depthFt },
      feet(section.heightFt),
      section.color,
      0.96,
    );
  }
}

function buildFuelDepot(group, section) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(feet(section.radiusFt), feet(0.08), 6, 72),
    materialFor('#101820', 0.34),
  );
  ring.position.set(x, feet(0.15), z);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(feet(4.2), feet(4.2), feet(section.heightFt), 24),
    materialFor(section.color),
  );
  tank.position.set(x, feet(section.heightFt / 2), z);
  group.add(tank);
}

function buildFlatZone(group, section) {
  addFloor(group, section, 0.48);
}

function buildTentCamping(group, section) {
  addFloor(group, section, 0.26);
  const tentMaterial = materialFor('#bfddeb', 0.86);
  const tentGeometry = new THREE.ConeGeometry(feet(5.5), feet(section.heightFt), 4);
  const offsets = [
    [-18, -7],
    [0, -7],
    [18, -7],
    [-10, 8],
    [10, 8],
  ];

  offsets.forEach(([xOffset, zOffset]) => {
    const { x, z } = feetToWorld(section.xFt + xOffset, section.zFt + zOffset);
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.position.set(x, feet(section.heightFt / 2), z);
    tent.rotation.y = Math.PI / 4;
    group.add(tent);
  });
}

function buildMultiVehicle(group, section) {
  section.parts.forEach((part) => {
    addPartBox(group, section, part, feet(8), section.color, 0.96);
  });
}

function buildParking(group, section) {
  section.parts.forEach((part) => {
    addPartBox(group, section, part, feet(0.55), section.color, 0.54);
    const { x, z } = feetToWorld(part.xFt, part.zFt);
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(feet(part.widthFt * 0.78), feet(0.08), feet(0.3)),
      materialFor('#101820', 0.32),
    );
    marker.position.set(x, feet(0.62), z);
    group.add(marker);
  });
}

function buildPods(group, section) {
  const radius = feet(section.radiusFt);
  const height = feet(section.heightFt);
  section.positionsFt.forEach(([xFt, zFt]) => {
    const { x, z } = feetToWorld(xFt, zFt);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height * 0.62, 6),
      materialFor(section.color, 0.92),
    );
    base.position.set(x, height * 0.31, z);
    group.add(base);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.98, height * 0.55, 6),
      materialFor('#f8fbfd', 0.96),
    );
    roof.position.set(x, height * 0.9, z);
    group.add(roof);
  });
}

function addFloor(group, section, opacity) {
  addPartBox(group, section, section, feet(section.heightFt ?? 0.3), section.color, opacity);
}

function addPartBox(group, section, part, height, color, opacity) {
  const { x, z } = feetToWorld(part.xFt, part.zFt);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(feet(part.widthFt), height, feet(part.depthFt)),
    materialFor(color, opacity),
  );
  mesh.position.set(x, height / 2, z);
  mesh.userData.section = section;
  group.add(mesh);
}

function addBikeRacks(group, section, part) {
  const rackMaterial = materialFor('#26343b', 0.68);
  const rackCount = Math.max(3, Math.floor(part.widthFt / 14));
  for (let index = 0; index < rackCount; index += 1) {
    const xFt = part.xFt - part.widthFt / 2 + 8 + index * 12;
    const { x, z } = feetToWorld(xFt, part.zFt);
    const rack = new THREE.Mesh(
      new THREE.TorusGeometry(feet(1.6), feet(0.08), 6, 18),
      rackMaterial,
    );
    rack.scale.z = 0.45;
    rack.position.set(x, feet(1), z);
    rack.rotation.x = Math.PI / 2;
    group.add(rack);
  }
}

function addLabel(group, section) {
  const label = createTextLabel(section);
  const anchor = getSectionAnchor(section);
  label.position.set(anchor.x, anchor.y, anchor.z);
  label.userData.section = section;
  group.add(label);
}

function getSectionAnchor(section) {
  if (section.positionsFt?.length) {
    const average = section.positionsFt.reduce(
      (sum, [xFt, zFt]) => ({ xFt: sum.xFt + xFt, zFt: sum.zFt + zFt }),
      { xFt: 0, zFt: 0 },
    );
    const { x, z } = feetToWorld(
      average.xFt / section.positionsFt.length,
      average.zFt / section.positionsFt.length,
    );
    return { x, y: feet(13), z };
  }

  if (section.parts?.length) {
    const first = section.parts[Math.floor(section.parts.length / 2)];
    const { x, z } = feetToWorld(first.xFt, first.zFt);
    return { x, y: feet(13), z };
  }

  const { x, z } = feetToWorld(section.xFt, section.zFt);
  return { x, y: feet(Math.max(section.heightFt ?? 10, 10) + 6), z };
}

function addHitBox(group, section, height) {
  const { x, z } = feetToWorld(section.xFt, section.zFt);
  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(feet(section.widthFt), height, feet(section.depthFt)),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  hitBox.position.set(x, height / 2, z);
  hitBox.userData.section = section;
  group.add(hitBox);
}

function markClickable(root, section) {
  root.traverse((child) => {
    child.userData.section = section;
  });
}

function materialFor(color, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    ...defaultMaterialOptions,
  });
}
