import * as THREE from "three";

const COLORS = {
  orange: 0xf48732,
  orangeDark: 0xc95e20,
  belly: 0xf1dd72,
  ink: 0x151515,
  cap: 0x17191d,
  capRed: 0x9e1f2f,
  gold: 0xe6b84f,
  flame: 0xff542b,
  flameCore: 0xffd43b,
};

type VectorTuple = [number, number, number];
type MascotMaterial = THREE.MeshStandardMaterial;
type MascotParts = {
  headPivot: THREE.Group;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightElbow: THREE.Group;
  tailPivot: THREE.Group;
  flame: THREE.Group;
  mouth: THREE.Mesh;
  cap: THREE.Group;
};
type MascotModel = THREE.Group & { userData: { sculptRuntime?: { approximate: boolean; sourceView: string; parts: MascotParts; colliders: Array<{ id: string; type: string; center: VectorTuple; scale: VectorTuple }> } } };
type MascotMaterials = { body: MascotMaterial; bodyDark: MascotMaterial; belly: MascotMaterial; ink: MascotMaterial; cap: MascotMaterial; red: MascotMaterial; gold: MascotMaterial; flame: MascotMaterial; flameCore: MascotMaterial };

function material(color: THREE.ColorRepresentation, options: THREE.MeshStandardMaterialParameters = {}): MascotMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.64, metalness: 0, ...options });
}

function ellipsoid(name: string, radius: number, scale: VectorTuple, mat: MascotMaterial, position: VectorTuple = [0, 0, 0], segments = 24): THREE.Mesh<THREE.SphereGeometry, MascotMaterial> {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(12, segments / 2)), mat);
  mesh.name = name;
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function capsulePart(name: string, length: number, radius: number, mat: MascotMaterial): THREE.Group {
  const group = new THREE.Group();
  group.name = name;
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, length, 16), mat);
  cylinder.position.y = -length / 2;
  const top = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 10), mat);
  const bottom = top.clone();
  bottom.position.y = -length;
  group.add(cylinder, top, bottom);
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = true;
  });
  return group;
}

function makeSmile(ink: MascotMaterial): THREE.Mesh<THREE.TubeGeometry, MascotMaterial> {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.42, 0.05, 0),
    new THREE.Vector3(-0.12, -0.08, 0.04),
    new THREE.Vector3(0.18, -0.1, 0.04),
    new THREE.Vector3(0.38, 0.0, 0),
  ]);
  const smile = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.025, 8, false), ink);
  smile.name = "mouth-smile";
  smile.position.set(0, 2.68, 0.89);
  return smile;
}

function makeFlame(outerMaterial: MascotMaterial, innerMaterial: MascotMaterial): THREE.Group {
  const flame = new THREE.Group();
  flame.name = "tail-flame";
  const outer = ellipsoid("flame-outer", 0.24, [0.72, 1.45, 0.6], outerMaterial);
  outer.rotation.z = -0.2;
  const tip = ellipsoid("flame-tip", 0.16, [0.55, 1.45, 0.5], outerMaterial, [0.05, 0.28, 0]);
  tip.rotation.z = 0.38;
  const core = ellipsoid("flame-core", 0.14, [0.58, 1.08, 0.55], innerMaterial, [0.02, -0.04, 0.12]);
  core.rotation.z = -0.16;
  flame.add(outer, tip, core);
  return flame;
}

function createArm(side: "left" | "right", bodyMaterial: MascotMaterial, inkMaterial: MascotMaterial): { shoulder: THREE.Group; elbow: THREE.Group } {
  const sign = side === "left" ? 1 : -1;
  const shoulder = new THREE.Group();
  shoulder.name = `shoulder-${side}`;
  shoulder.position.set(sign * 0.58, 2.08, 0.04);
  shoulder.rotation.z = sign * -0.22;

  const upper = capsulePart(`upper-arm-${side}`, 0.52, 0.16, bodyMaterial);
  const elbow = new THREE.Group();
  elbow.name = `elbow-${side}`;
  elbow.position.y = -0.5;
  elbow.rotation.x = -0.92;
  const forearm = capsulePart(`forearm-${side}`, 0.42, 0.15, bodyMaterial);
  const hand = ellipsoid(`hand-${side}`, 0.2, [0.78, 1.02, 0.72], bodyMaterial, [0, -0.46, 0]);
  elbow.add(forearm, hand);

  for (let index = -1; index <= 1; index += 1) {
    const claw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 8), inkMaterial);
    claw.name = `claw-${side}-${index + 2}`;
    claw.position.set(index * 0.055, -0.46, 0.145);
    claw.rotation.z = index * 0.12;
    elbow.add(claw);
  }

  shoulder.add(upper, elbow);
  return { shoulder, elbow };
}

function createLeg(side: "left" | "right", bodyMaterial: MascotMaterial, inkMaterial: MascotMaterial): THREE.Group {
  const sign = side === "left" ? 1 : -1;
  const hip = new THREE.Group();
  hip.name = `hip-${side}`;
  hip.position.set(sign * 0.25, 1.06, 0);
  const leg = capsulePart(`leg-${side}`, 0.88, 0.2, bodyMaterial);
  const foot = ellipsoid(`foot-${side}`, 0.25, [1.25, 0.46, 1.35], bodyMaterial, [sign * 0.035, -0.9, 0.16]);
  const sole = ellipsoid(`sole-${side}`, 0.22, [1.35, 0.1, 1.35], inkMaterial, [sign * 0.035, -0.99, 0.17], 18);
  hip.add(leg, foot, sole);
  return hip;
}

function createCap(materials: MascotMaterials): THREE.Group {
  const cap = new THREE.Group();
  cap.name = "peaked-cap";
  cap.position.set(0, 3.5, 0.02);
  cap.rotation.z = -0.08;

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.54, 0.35, 32), materials.cap);
  crown.name = "cap-crown";
  crown.scale.z = 0.78;
  crown.position.y = 0.08;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.545, 0.55, 0.13, 32), materials.red);
  band.name = "cap-red-band";
  band.scale.z = 0.8;
  band.position.y = -0.12;
  const visor = ellipsoid("cap-visor", 0.42, [1.15, 0.12, 0.72], materials.cap, [0, -0.22, 0.33], 24);
  visor.rotation.x = -0.1;
  const braid = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 8, 32, Math.PI), materials.gold);
  braid.name = "cap-gold-braid";
  braid.position.set(0, -0.13, 0.43);
  braid.rotation.z = Math.PI;

  const emblem = new THREE.Group();
  emblem.name = "cap-generic-emblem";
  emblem.position.set(0, 0.08, 0.45);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), materials.gold);
  emblem.add(disc);
  for (let index = 0; index < 8; index += 1) {
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.14, 4), materials.gold);
    ray.position.set(Math.cos(index * Math.PI / 4) * 0.12, Math.sin(index * Math.PI / 4) * 0.12, 0);
    ray.rotation.z = index * Math.PI / 4 - Math.PI / 2;
    emblem.add(ray);
  }

  cap.add(crown, band, visor, braid, emblem);
  return cap;
}

export function createQuizMascotModel(): MascotModel {
  const root = new THREE.Group() as MascotModel;
  root.name = "quiz-explainer-mascot";

  const materials = {
    body: material(COLORS.orange),
    bodyDark: material(COLORS.orangeDark),
    belly: material(COLORS.belly, { roughness: 0.78 }),
    ink: material(COLORS.ink, { roughness: 0.82 }),
    cap: material(COLORS.cap, { roughness: 0.48 }),
    red: material(COLORS.capRed, { roughness: 0.52 }),
    gold: material(COLORS.gold, { roughness: 0.32, metalness: 0.75 }),
    flame: material(COLORS.flame, { emissive: COLORS.flame, emissiveIntensity: 0.45, roughness: 0.4 }),
    flameCore: material(COLORS.flameCore, { emissive: COLORS.flameCore, emissiveIntensity: 0.8, roughness: 0.35 }),
  };

  const torso = ellipsoid("torso", 0.72, [0.8, 1.18, 0.66], materials.body, [0, 1.55, 0]);
  const belly = ellipsoid("ventral-belly", 0.58, [0.7, 1.18, 0.22], materials.belly, [0, 1.53, 0.57]);
  root.add(torso, belly);

  const neck = ellipsoid("neck", 0.38, [0.75, 0.9, 0.7], materials.body, [0, 2.32, 0]);
  const headPivot = new THREE.Group();
  headPivot.name = "head-pivot";
  headPivot.position.set(0, 2.53, 0);
  const cranium = ellipsoid("cranium", 0.66, [1.03, 0.84, 0.82], materials.body, [0, 0.36, 0]);
  const snout = ellipsoid("wide-snout", 0.55, [1.13, 0.52, 0.58], materials.body, [0, 0.13, 0.48]);
  headPivot.add(cranium, snout);
  root.add(neck, headPivot);

  const eyeLeft = ellipsoid("eye-left", 0.09, [0.48, 1.15, 0.35], materials.ink, [0.24, 3.04, 0.62], 16);
  const eyeRight = eyeLeft.clone();
  eyeRight.name = "eye-right";
  eyeRight.position.x = -0.24;
  const nostrilLeft = ellipsoid("nostril-left", 0.045, [0.65, 0.4, 0.3], materials.ink, [0.11, 2.85, 0.91], 12);
  const nostrilRight = nostrilLeft.clone();
  nostrilRight.name = "nostril-right";
  nostrilRight.position.x = -0.11;
  const mouth = makeSmile(materials.ink);
  root.add(eyeLeft, eyeRight, nostrilLeft, nostrilRight, mouth);

  const leftArm = createArm("left", materials.body, materials.ink);
  const rightArm = createArm("right", materials.body, materials.ink);
  const leftLeg = createLeg("left", materials.body, materials.ink);
  const rightLeg = createLeg("right", materials.body, materials.ink);
  root.add(leftArm.shoulder, rightArm.shoulder, leftLeg, rightLeg);

  const tailPivot = new THREE.Group();
  tailPivot.name = "tail-pivot";
  tailPivot.position.set(0, 1.34, -0.28);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.45, -0.05, -0.05),
    new THREE.Vector3(0.95, -0.18, 0.05),
    new THREE.Vector3(1.38, 0.02, 0.1),
    new THREE.Vector3(1.7, 0.3, 0.12),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 40, 0.2, 16, false), materials.body);
  tail.name = "swept-tail";
  tail.castShadow = true;
  const flame = makeFlame(materials.flame, materials.flameCore);
  flame.position.set(1.7, 0.55, 0.12);
  tailPivot.add(tail, flame);
  root.add(tailPivot);

  const cap = createCap(materials);
  root.add(cap);

  root.userData.sculptRuntime = {
    approximate: true,
    sourceView: "single-front-three-quarter",
    parts: { headPivot, leftShoulder: leftArm.shoulder, rightShoulder: rightArm.shoulder, leftElbow: leftArm.elbow, rightElbow: rightArm.elbow, tailPivot, flame, mouth, cap },
    colliders: [
      { id: "torso", type: "ellipsoid", center: [0, 1.55, 0], scale: [0.58, 0.85, 0.48] },
      { id: "head", type: "ellipsoid", center: [0, 2.9, 0.2], scale: [0.7, 0.58, 0.62] },
    ],
  };

  return root;
}

export function animateQuizMascot(model: MascotModel, elapsedSeconds: number, speaking = false, reducedMotion = false): void {
  const parts = model.userData.sculptRuntime?.parts;
  if (!parts) return;
  const motion = reducedMotion ? 0.25 : 1;
  const talk = speaking ? 1 : 0.35;
  model.position.y = Math.sin(elapsedSeconds * 2.1) * 0.025 * motion;
  parts.headPivot.rotation.z = Math.sin(elapsedSeconds * 2.7) * 0.045 * talk * motion;
  parts.headPivot.rotation.x = Math.sin(elapsedSeconds * 3.2) * 0.035 * talk * motion;
  parts.leftShoulder.rotation.z = -0.22 + Math.sin(elapsedSeconds * 2.4) * 0.18 * talk * motion;
  parts.rightShoulder.rotation.z = 0.22 - Math.sin(elapsedSeconds * 2.4 + 0.9) * 0.26 * talk * motion;
  parts.rightElbow.rotation.x = -0.92 + Math.sin(elapsedSeconds * 3.4) * 0.2 * talk * motion;
  parts.tailPivot.rotation.y = Math.sin(elapsedSeconds * 1.7) * 0.18 * motion;
  const flameScale = 1 + Math.sin(elapsedSeconds * 8.3) * 0.09 * motion;
  parts.flame.scale.set(flameScale, 1 + (flameScale - 1) * 1.8, flameScale);
  parts.mouth.scale.y = speaking ? 1 + Math.abs(Math.sin(elapsedSeconds * 9)) * 0.35 * motion : 1;
}

export function disposeQuizMascotModel(model: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (child.geometry) geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((item) => materials.add(item));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((item) => item.dispose());
}
