// The treasures themselves: small things made of a few primitives, which the painter then covers in dabs exactly as
// it covers a trunk or a cloak. Each part carries its own palette (light, half-tone, shade); the flat colour it is
// built with is only the underpainting that shows between the strokes.
import * as THREE from 'three';

export const PALETTE = {
  brass: [[0.96, 0.8, 0.42], [0.64, 0.45, 0.16], [0.26, 0.17, 0.07]],
  iron: [[0.74, 0.78, 0.84], [0.37, 0.41, 0.49], [0.14, 0.16, 0.22]],
  glass: [[0.78, 0.95, 1.0], [0.42, 0.64, 0.78], [0.15, 0.28, 0.42]],
  clay: [[0.88, 0.74, 0.6], [0.56, 0.41, 0.31], [0.26, 0.18, 0.14]],
  wood: [[0.7, 0.48, 0.27], [0.37, 0.23, 0.12], [0.15, 0.09, 0.05]],
  ochre: [[0.86, 0.63, 0.29], [0.5, 0.33, 0.12], [0.2, 0.13, 0.06]],
  wax: [[0.74, 0.22, 0.2], [0.42, 0.09, 0.1], [0.16, 0.04, 0.05]],
  tin: [[0.82, 0.8, 0.72], [0.46, 0.46, 0.43], [0.2, 0.2, 0.22]],
  cream: [[0.95, 0.91, 0.79], [0.7, 0.64, 0.52], [0.36, 0.32, 0.26]],
};

function part(geometry, pal, at = [0, 0, 0], turn = [0, 0, 0], scale = [1, 1, 1]) {
  // A dark version of the half-tone is the underpainting: what shows between the strokes reads as shadowed paint,
  // not as a flat sticker and not as a hole.
  const under = pal[1].map((v) => v * 0.55);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(...under) }));
  mesh.position.set(...at);
  mesh.rotation.set(...turn);
  mesh.scale.set(...scale);
  mesh.userData.pal = pal;
  return mesh;
}

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

/**
 * One thing per kind. Each is built standing on the ground: y = 0 is where it sits, and it is no bigger than a
 * boot, so the wanderer has to come close and look down to see it.
 */
export const THINGS = {
  key() {
    const g = new THREE.Group();
    g.add(part(new THREE.TorusGeometry(0.055, 0.014, 6, 14), PALETTE.brass, [-0.1, 0.016, 0], [Math.PI / 2, 0, 0]));
    g.add(part(box(0.22, 0.028, 0.016), PALETTE.brass, [0.045, 0.014, 0]));
    g.add(part(box(0.03, 0.055, 0.016), PALETTE.brass, [0.14, 0.03, 0]));
    g.add(part(box(0.02, 0.038, 0.016), PALETTE.brass, [0.08, 0.022, 0]));
    g.rotation.y = -0.4;
    return g;
  },

  bell() {
    const g = new THREE.Group();
    g.add(part(new THREE.ConeGeometry(0.1, 0.2, 10, 1, true), PALETTE.brass, [0, 0.1, 0]));
    g.add(part(new THREE.SphereGeometry(0.032, 8, 6), PALETTE.brass, [0, 0.208, 0]));
    g.add(part(new THREE.TorusGeometry(0.022, 0.007, 5, 10), PALETTE.brass, [0, 0.24, 0], [Math.PI / 2, 0, 0]));
    return g;
  },

  vial() {
    const g = new THREE.Group();
    g.add(part(new THREE.CylinderGeometry(0.045, 0.052, 0.18, 10), PALETTE.glass, [0, 0.09, 0]));
    g.add(part(new THREE.CylinderGeometry(0.022, 0.032, 0.045, 8), PALETTE.glass, [0, 0.2, 0]));
    g.add(part(new THREE.CylinderGeometry(0.024, 0.024, 0.038, 8), PALETTE.wood, [0, 0.238, 0]));
    return g;
  },

  watch() {
    const g = new THREE.Group();
    g.add(part(new THREE.CylinderGeometry(0.07, 0.07, 0.022, 16), PALETTE.brass, [0, 0.014, 0]));
    g.add(part(new THREE.CylinderGeometry(0.058, 0.058, 0.006, 16), PALETTE.cream, [0, 0.027, 0]));
    g.add(part(box(0.026, 0.03, 0.016), PALETTE.brass, [0, 0.014, 0.078]));
    g.add(part(new THREE.TorusGeometry(0.026, 0.007, 5, 12), PALETTE.brass, [0, 0.014, 0.108], [Math.PI / 2, 0, 0]));
    return g;
  },

  bird() {
    const g = new THREE.Group();
    g.add(part(new THREE.SphereGeometry(0.075, 10, 8), PALETTE.wood, [0, 0.08, 0], [0, 0, 0], [1.5, 1, 1]));
    g.add(part(new THREE.SphereGeometry(0.046, 9, 7), PALETTE.wood, [0.095, 0.135, 0]));
    g.add(part(new THREE.ConeGeometry(0.018, 0.055, 7), PALETTE.ochre, [0.148, 0.13, 0], [0, 0, -Math.PI / 2]));
    g.add(part(box(0.09, 0.012, 0.055), PALETTE.wood, [-0.105, 0.075, 0], [0, 0, 0.28]));
    return g;
  },

  cup() {
    const g = new THREE.Group();
    g.add(part(new THREE.CylinderGeometry(0.062, 0.045, 0.095, 12), PALETTE.clay, [0, 0.048, 0]));
    g.add(part(new THREE.CylinderGeometry(0.056, 0.056, 0.008, 12), PALETTE.ochre, [0, 0.05, 0]));
    g.add(part(new THREE.TorusGeometry(0.034, 0.008, 5, 10, Math.PI * 1.2), PALETTE.clay, [0.072, 0.052, 0], [0, 0, -0.4]));
    return g;
  },

  knife() {
    const g = new THREE.Group();
    g.add(part(box(0.19, 0.006, 0.038), PALETTE.tin, [0.06, 0.006, 0], [0, 0.06, 0]));
    g.add(part(box(0.1, 0.022, 0.026), PALETTE.wood, [-0.09, 0.011, 0], [0, 0.06, 0]));
    g.add(part(box(0.012, 0.014, 0.034), PALETTE.brass, [-0.04, 0.011, 0], [0, 0.06, 0]));
    g.rotation.z = 1.05; // stood up in the leaves, the way a knife is left when someone means to come back
    return g;
  },

  marble() {
    const g = new THREE.Group();
    g.add(part(new THREE.SphereGeometry(0.055, 12, 10), PALETTE.glass, [0, 0.055, 0]));
    return g;
  },

  acorn() {
    const g = new THREE.Group();
    g.add(part(new THREE.SphereGeometry(0.05, 10, 8), PALETTE.ochre, [0, 0.055, 0], [0, 0, 0], [1, 1.2, 1]));
    g.add(part(new THREE.SphereGeometry(0.052, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), PALETTE.wood, [0, 0.095, 0]));
    g.add(part(new THREE.CylinderGeometry(0.007, 0.007, 0.03, 5), PALETTE.wood, [0, 0.125, 0]));
    return g;
  },

  tube() {
    const g = new THREE.Group();
    g.add(part(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 10), PALETTE.ochre, [0, 0.07, 0]));
    g.add(part(new THREE.ConeGeometry(0.026, 0.05, 8), PALETTE.tin, [0, 0.155, 0]));
    g.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), PALETTE.brass, [0, 0.192, 0]));
    g.add(part(box(0.06, 0.012, 0.05), PALETTE.tin, [0, 0.012, 0]));
    return g;
  },

  shard() {
    const g = new THREE.Group();
    g.add(part(box(0.17, 0.008, 0.12), PALETTE.tin, [0, 0.014, 0], [0.06, 0.35, 0.05]));
    g.add(part(box(0.02, 0.01, 0.02), PALETTE.brass, [0.05, 0.02, 0.02], [0, 0.35, 0]));
    g.rotation.x = -0.6; // leaning on the snow like a board left standing
    return g;
  },

  letter() {
    const g = new THREE.Group();
    g.add(part(box(0.17, 0.014, 0.115), PALETTE.cream, [0, 0.014, 0], [0, 0.2, 0]));
    g.add(part(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 10), PALETTE.wax, [0.01, 0.026, 0.005]));
    return g;
  },

  oilcan() {
    const g = new THREE.Group();
    g.add(part(new THREE.CylinderGeometry(0.07, 0.075, 0.13, 12), PALETTE.iron, [0, 0.075, 0]));
    g.add(part(new THREE.CylinderGeometry(0.078, 0.078, 0.02, 12), PALETTE.brass, [0, 0.15, 0]));
    g.add(part(new THREE.CylinderGeometry(0.012, 0.02, 0.11, 7), PALETTE.brass, [0.075, 0.15, 0], [0, 0, -0.55]));
    g.add(part(new THREE.TorusGeometry(0.045, 0.008, 5, 12), PALETTE.brass, [-0.06, 0.13, 0], [0, Math.PI / 2, 0]));
    return g;
  },
};
