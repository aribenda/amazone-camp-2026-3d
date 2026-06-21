import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { feet, feetToWorld } from '../campLayout.js';
import { createTextLabel } from './textLabels.js';

const defaultMaterialOptions = {
  roughness: 0.85,
  metalness: 0.02,
};

let yurtWallMaterial;
let yurtRoofMaterial;
let yurtTapeMaterial;
const gltfLoader = new GLTFLoader();
const modelCache = new Map();

const carModels = [
  {
    url: '/models/2005_bmw_m3.glb',
    lengthFt: 11.2,
    widthFt: 5,
    heightFt: 3.8,
  },
  {
    url: '/models/car3.glb',
    lengthFt: 17,
    widthFt: 7.1,
    heightFt: 5.8,
  },
  {
    url: '/models/wasteland_wagon.glb',
    lengthFt: 17,
    widthFt: 6.8,
    heightFt: 6.2,
  },
];

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
    yurts: buildYurts,
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
    addRV(group, section, part);
  });
}

function buildParking(group, section) {
  getCarParkingSpots().forEach((spot, index) => {
    addModelCar(group, section, spot, carModels[spot.modelIndex], index);
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

function buildYurts(group, section) {
  const radius = feet(section.radiusFt);
  const totalHeight = feet(section.heightFt);
  const wallHeight = totalHeight * 0.58;
  const roofHeight = totalHeight * 0.56;
  const wallGeometry = new THREE.CylinderGeometry(radius, radius, wallHeight, 8, 1, false);
  const roofGeometry = new THREE.ConeGeometry(radius * 1.04, roofHeight, 8, 1, false);
  const ringGeometry = new THREE.TorusGeometry(radius * 1.006, feet(0.035), 8, 72);
  const verticalSeamGeometry = new THREE.BoxGeometry(feet(0.16), wallHeight * 0.95, feet(0.055));

  section.positionsFt.forEach(([xFt, zFt], index) => {
    const { x, z } = feetToWorld(xFt, zFt);
    const yurt = new THREE.Group();
    yurt.position.set(x, 0, z);
    yurt.rotation.y = (index % 8) * (Math.PI / 16);

    const wall = new THREE.Mesh(wallGeometry, getYurtWallMaterial());
    wall.position.y = wallHeight / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    yurt.add(wall);

    const roof = new THREE.Mesh(roofGeometry, getYurtRoofMaterial());
    roof.position.y = wallHeight + roofHeight / 2 - feet(0.2);
    roof.castShadow = true;
    roof.receiveShadow = true;
    yurt.add(roof);

    [0.23, 0.5, 0.78].forEach((ratio) => {
      const ring = new THREE.Mesh(ringGeometry, getYurtTapeMaterial());
      ring.rotation.x = Math.PI / 2;
      ring.position.y = wallHeight * ratio;
      yurt.add(ring);
    });

    for (let side = 0; side < 8; side += 1) {
      const angle = (side / 8) * Math.PI * 2;
      const seam = new THREE.Mesh(verticalSeamGeometry, getYurtTapeMaterial());
      seam.position.set(Math.sin(angle) * radius, wallHeight * 0.5, Math.cos(angle) * radius);
      seam.rotation.y = angle;
      yurt.add(seam);
    }

    addYurtScuffs(yurt, radius, wallHeight, index);
    group.add(yurt);
  });
}

function addRV(group, section, part) {
  const { x, z } = feetToWorld(part.xFt, part.zFt);
  const rv = new THREE.Group();
  const length = Math.max(feet(Math.max(part.widthFt, part.depthFt) * 0.84), feet(7));
  const width = Math.min(feet(Math.min(part.widthFt, part.depthFt) * 0.82), feet(8.2));
  const isTrailer = part.widthFt < 10 || part.depthFt < 10;
  const silver = materialFor('#d7dcda', 0.98);
  const white = materialFor('#f0efe7', 0.98);
  const trimMaterial = materialFor('#b9b4a8', 0.9);
  const windowMaterial = materialFor('#283b43', 0.78);

  rv.position.set(x, 0, z);
  rv.rotation.y = part.widthFt >= part.depthFt ? Math.PI / 2 : 0;

  if (isTrailer) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, feet(5.4), length),
      silver,
    );
    body.position.y = feet(3.05);
    body.castShadow = true;
    body.receiveShadow = true;
    rv.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width * 1.04, feet(0.32), length * 0.96),
      materialFor('#eef0ea', 0.98),
    );
    roof.position.y = feet(5.92);
    rv.add(roof);
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, feet(6.5), length),
      white,
    );
    body.position.y = feet(3.45);
    body.castShadow = true;
    body.receiveShadow = true;
    rv.add(body);

    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.82, feet(3.8), length * 0.24),
      materialFor('#d4d8d2', 0.96),
    );
    cab.position.set(0, feet(2.65), length * 0.62);
    rv.add(cab);

    const roofUnit = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.45, feet(0.42), length * 0.18),
      trimMaterial,
    );
    roofUnit.position.set(0, feet(7), -length * 0.16);
    rv.add(roofUnit);
  }

  [-0.28, 0.08, 0.42].forEach((offset) => {
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.09, feet(1.05), length * 0.15),
      windowMaterial,
    );
    window.position.set(width * 0.51, feet(4.25), length * offset);
    rv.add(window);
  });

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.06, feet(0.18), length * 0.58),
    materialFor('#c8b88b', 0.92),
  );
  awning.position.set(width * 0.56, feet(5.55), -length * 0.06);
  rv.add(awning);

  addVehicleWheels(rv, width, length, feet(1.2));
  group.add(rv);
}

function getCarParkingSpots() {
  // The original plan draws one parking spot near the toilets/fire lane and six
  // lower spots. This uses that lower footprint plus two extra staggered cars
  // inside the same boundary, keeping clear of the toilet/fire-lane area.
  return [
    { xFt: 102, zFt: 174, rotationDeg: -2, modelIndex: 2 },
    { xFt: 110, zFt: 174, rotationDeg: 1, modelIndex: 1 },
    { xFt: 118, zFt: 174, rotationDeg: -1, modelIndex: 0 },
    { xFt: 126, zFt: 174, rotationDeg: 2, modelIndex: 2 },
    { xFt: 134, zFt: 174, rotationDeg: -2, modelIndex: 1 },
    { xFt: 142, zFt: 174, rotationDeg: 1, modelIndex: 2 },
    { xFt: 150, zFt: 174, rotationDeg: -1, modelIndex: 1 },
    { xFt: 102, zFt: 190, rotationDeg: 2, modelIndex: 1 },
    { xFt: 110, zFt: 190, rotationDeg: -1, modelIndex: 2 },
    { xFt: 118, zFt: 190, rotationDeg: 1, modelIndex: 0 },
    { xFt: 126, zFt: 190, rotationDeg: -2, modelIndex: 1 },
    { xFt: 134, zFt: 190, rotationDeg: 2, modelIndex: 2 },
    { xFt: 142, zFt: 190, rotationDeg: -1, modelIndex: 1 },
    { xFt: 150, zFt: 190, rotationDeg: 1, modelIndex: 2 },
  ].map((spot) => ({
    ...spot,
    rotationY: THREE.MathUtils.degToRad(spot.rotationDeg),
  }));
}

function addModelCar(group, section, spot, modelConfig, index) {
  const { x, z } = feetToWorld(spot.xFt, spot.zFt);
  const anchor = new THREE.Group();
  anchor.name = `${section.name} car ${index + 1}`;
  anchor.position.set(x, 0, z);
  anchor.rotation.y = spot.rotationY;
  anchor.userData.section = section;

  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(feet(modelConfig.widthFt), feet(modelConfig.heightFt), feet(modelConfig.lengthFt)),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  hitBox.position.y = feet(modelConfig.heightFt / 2);
  hitBox.userData.section = section;
  anchor.add(hitBox);

  group.add(anchor);

  loadModel(modelConfig.url)
    .then((source) => {
      const model = source.clone(true);
      model.userData.section = section;
      prepareLoadedModel(model, section);
      scaleModelToLength(model, modelConfig);
      anchor.add(model);
    })
    .catch((error) => {
      console.warn(`Could not load car model ${modelConfig.url}`, error);
    });
}

function loadModel(url) {
  if (!modelCache.has(url)) {
    modelCache.set(
      url,
      gltfLoader.loadAsync(url).then((gltf) => gltf.scene),
    );
  }

  return modelCache.get(url);
}

function prepareLoadedModel(model, section) {
  model.traverse((child) => {
    child.userData.section = section;
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material) {
      child.material.side = THREE.FrontSide;
    }
  });
}

function scaleModelToLength(model, { lengthFt }) {
  const initialBox = new THREE.Box3().setFromObject(model);
  const initialCenter = initialBox.getCenter(new THREE.Vector3());
  model.position.sub(initialCenter);
  model.updateMatrixWorld(true);

  const unrotatedSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const longAxis = Math.max(unrotatedSize.x, unrotatedSize.z);
  model.rotation.y = unrotatedSize.x > unrotatedSize.z ? Math.PI / 2 : 0;
  model.scale.multiplyScalar(feet(lengthFt) / Math.max(longAxis, 0.001));
  model.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = scaledBox.getCenter(new THREE.Vector3());
  const minY = scaledBox.min.y;
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= minY;
}

function addVehicleWheels(group, width, length, radius) {
  const tireMaterial = materialFor('#111416', 0.96);
  const rimMaterial = materialFor('#c7c1b4', 0.82);
  const wheelGeometry = new THREE.CylinderGeometry(radius, radius, feet(0.55), 18);
  const rimGeometry = new THREE.CylinderGeometry(radius * 0.48, radius * 0.48, feet(0.6), 14);

  [-1, 1].forEach((xSign) => {
    [-0.34, 0.34].forEach((zOffset) => {
      const wheel = new THREE.Mesh(wheelGeometry, tireMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(xSign * width * 0.52, radius, zOffset * length);
      group.add(wheel);

      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      rim.position.copy(wheel.position);
      group.add(rim);
    });
  });
}

function addYurtScuffs(group, radius, wallHeight, seed) {
  const scuffMaterial = new THREE.MeshBasicMaterial({
    color: '#6f7069',
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });

  for (let index = 0; index < 7; index += 1) {
    const angle = ((seed * 0.37 + index * 0.19) % 1) * Math.PI * 2;
    const width = feet(0.65 + (index % 3) * 0.26);
    const height = feet(0.16 + (index % 2) * 0.18);
    const scuff = new THREE.Mesh(new THREE.PlaneGeometry(width, height), scuffMaterial);
    scuff.position.set(
      Math.sin(angle) * (radius + feet(0.035)),
      wallHeight * (0.22 + ((seed + index) % 5) * 0.13),
      Math.cos(angle) * (radius + feet(0.035)),
    );
    scuff.rotation.y = angle;
    scuff.rotation.z = ((seed + index) % 4 - 1.5) * 0.08;
    group.add(scuff);
  }
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

function getYurtWallMaterial() {
  if (!yurtWallMaterial) {
    const texture = createYurtTexture('wall');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 1);
    yurtWallMaterial = new THREE.MeshStandardMaterial({
      color: '#f8fbfa',
      map: texture,
      roughness: 0.22,
      metalness: 0.2,
      emissive: '#d6e0df',
      emissiveIntensity: 0.2,
      envMapIntensity: 0.65,
    });
  }

  return yurtWallMaterial;
}

function getYurtRoofMaterial() {
  if (!yurtRoofMaterial) {
    const texture = createYurtTexture('roof');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.6, 1);
    yurtRoofMaterial = new THREE.MeshStandardMaterial({
      color: '#fbfdfc',
      map: texture,
      roughness: 0.18,
      metalness: 0.24,
      emissive: '#dce7e5',
      emissiveIntensity: 0.24,
      envMapIntensity: 0.72,
    });
  }

  return yurtRoofMaterial;
}

function getYurtTapeMaterial() {
  if (!yurtTapeMaterial) {
    yurtTapeMaterial = new THREE.MeshStandardMaterial({
      color: '#edf2ef',
      roughness: 0.26,
      metalness: 0.16,
      emissive: '#cbd6d3',
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0.9,
    });
  }

  return yurtTapeMaterial;
}

function createYurtTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const base = type === 'roof' ? '#e9eeec' : '#e3e9e7';
  const seam = type === 'roof' ? '#f8fbf6' : '#eef3f0';
  const cool = '#bfcfcd';

  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(0.38, 'rgba(198,220,219,0.26)');
  gradient.addColorStop(1, 'rgba(98,111,110,0.18)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.28;
  context.strokeStyle = cool;
  for (let x = -80; x < canvas.width + 120; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 92, canvas.height);
    context.stroke();
  }

  context.globalAlpha = 0.74;
  context.strokeStyle = seam;
  context.lineWidth = type === 'roof' ? 4 : 6;
  const seamStep = type === 'roof' ? 120 : 92;
  for (let y = seamStep; y < canvas.height; y += seamStep) {
    context.beginPath();
    context.moveTo(0, y + roughOffset(y, 3));
    context.lineTo(canvas.width, y + roughOffset(y + 9, 3));
    context.stroke();
  }

  context.globalAlpha = 0.2;
  context.strokeStyle = '#747d7b';
  context.lineWidth = 1;
  for (let y = 58; y < canvas.height; y += 86) {
    context.beginPath();
    context.moveTo(0, y + roughOffset(y, 5));
    context.lineTo(canvas.width, y + roughOffset(y + 21, 5));
    context.stroke();
  }

  context.globalAlpha = 0.18;
  for (let index = 0; index < 4200; index += 1) {
    const x = (index * 97) % canvas.width;
    const y = (index * 53) % canvas.height;
    const lightness = 94 - ((index * 17) % 34);
    context.fillStyle = `hsl(176 6% ${lightness}%)`;
    context.fillRect(x, y, 1 + (index % 2), 1);
  }

  context.globalAlpha = 0.2;
  context.fillStyle = '#666a66';
  for (let index = 0; index < 38; index += 1) {
    const x = (index * 61) % canvas.width;
    const y = (index * 137) % canvas.height;
    context.save();
    context.translate(x, y);
    context.rotate(((index % 9) - 4) * 0.08);
    context.fillRect(0, 0, 18 + (index % 4) * 9, 3 + (index % 3) * 2);
    context.restore();
  }

  context.globalAlpha = 0.24;
  context.fillStyle = '#f7faf2';
  for (let index = 0; index < 18; index += 1) {
    const x = (index * 113) % canvas.width;
    const y = (index * 71) % canvas.height;
    context.fillRect(x, y, 42 + (index % 3) * 20, 8 + (index % 2) * 6);
  }

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function roughOffset(seed, amount) {
  return Math.sin(seed * 12.9898) * amount;
}

function materialFor(color, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    ...defaultMaterialOptions,
  });
}
