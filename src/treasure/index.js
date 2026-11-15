// The treasures in one picture: what is hidden, drawn as paint like everything else, picked up by walking to it, and
// listed in the catalogue (src/treasure/book.js) when E is pressed.
//
// Each thing is a few primitives with a flat colour —the underpainting —and a couple of hundred dabs laid over it
// by src/oilpaint/pins.js, so it sits in the picture in the same paint as the snow and the trees. A small glow of
// additive strokes rises off each one, which is how it is found at all in the dark. The still world's shadow map is
// drawn once, at the start, so the things have to be in the shade scene before it is made: that is why this is
// created before createShade() in each picture.
import * as THREE from 'three';
import { dabMaterial, dabGeometry, dabMesh } from '../oilpaint/dabs.js';
import { pinDabs } from '../oilpaint/pins.js';
import { THINGS } from './things.js';
import { TREASURES } from './data.js';
import { createBook, readFound, writeFound } from './book.js';

const REACH = 1.9; // how near he has to come, in metres
const GLOW_PER = 9; // strokes of light rising off each thing

/** A place for a thing that is not inside a trunk: the spot asked for, or the nearest one beside it that is clear. */
function settle(at, avoid) {
  const clear = (px, pz) => avoid.every((a) => {
    const dx = px - a.x, dz = pz - a.z, r = (a.r ?? 0.5) + 1.0;
    return dx * dx + dz * dz > r * r;
  });
  const [x, z] = at;
  if (clear(x, z)) return [x, z];
  for (let ring = 1; ring <= 8; ring++) {
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + ring * 0.7;
      const px = x + Math.cos(a) * ring * 1.3, pz = z + Math.sin(a) * ring * 1.3;
      if (clear(px, pz)) return [px, pz];
    }
  }
  return [x, z];
}

export function createTreasures({ scene, shared, name, heightAt, avoid = [], shade = null, ui = true, mood = null }) {
  const all = readFound();
  const found = new Set(all[name] ?? []);
  const items = TREASURES[name] ?? [];
  const live = [];
  const depthOnly = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  // --- where they lie ---
  for (const item of items) {
    if (found.has(item.id)) continue;
    const [x, z] = settle(item.at, avoid);
    const y = heightAt(x, z);
    const group = THINGS[item.thing]();
    group.scale.setScalar(1.5); // still a thing you could carry in one hand, but big enough to be seen at all
    group.position.set(x, y + 0.12, z); // the ground is painted in strokes a hand wide: a thing lying flat in it is lost
    group.rotation.y = item.yaw ?? 0;
    group.name = `treasure:${item.id}`;
    scene.add(group);
    // what the moon or the sun sees of it, for the shadow it lays down
    if (shade) {
      const caster = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.36).translate(x, y + 0.16, z), depthOnly);
      caster.frustumCulled = false;
      shade.add(caster);
    }
    live.push({ item, x, y, z, group });
  }

  scene.updateMatrixWorld(true);

  // --- the paint over them ---
  // The palettes are the things' own colours; the picture's mood takes them as the picture takes everything else:
  // under the moon a brass key is a cold grey-green, and only the light coming off it stays warm. `floor` is lifted
  // into the shade tone alone, so a thing standing in a trunk's shadow still has colour of its own to be seen by.
  const mooded = (pal) => (mood
    ? pal.map((c, k) => c.map((v, i) => v * (mood.mul?.[i] ?? 1) + (mood.add?.[i] ?? 0) + (k === 2 ? (mood.floor?.[i] ?? 0) : 0)))
    : pal);
  for (const t of live) {
    const palettes = [];
    const parts = [];
    const big = t.group.scale.x;
    for (const mesh of t.group.children) {
      const pal = mesh.userData.pal;
      let k = palettes.indexOf(pal);
      if (k < 0) { palettes.push(mooded(pal)); k = palettes.length - 1; }
      mesh.geometry.computeBoundingSphere();
      const r = mesh.geometry.boundingSphere.radius * Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) * big;
      const count = THREE.MathUtils.clamp(Math.round(r * r * 26000), 120, 620);
      const across = Math.max(r * 0.13, 0.01), along = Math.max(r * 0.22, 0.016);
      parts.push({
        mesh, count,
        style: (p, n) => {
          // the stroke runs along the surface, in whatever direction it likes on this face: a grain of its own
          const d = new THREE.Vector3(Math.sin(p.x * 97.3 + p.z * 41.7), Math.cos(p.z * 63.1 + p.y * 29.3), Math.sin(p.y * 53.9 + p.x * 71.1));
          d.addScaledVector(n, -d.dot(n));
          if (d.lengthSq() < 1e-6) d.set(1, 0, 0);
          return { pal: k, size: [across, along], dir: d.normalize() };
        },
      });
    }
    if (!parts.length) continue;
    // a small round thing needs its paint stood well off the surface to beat the surface itself to the depth test
    const pins = pinDabs(shared, palettes, parts, { lift: 1.8 });
    scene.add(pins.mesh);
    pins.update();
    t.pins = pins.mesh;
  }

  // --- the glow off them ---
  const n = Math.max(live.length, 1);
  const aCenter = new Float32Array(n * GLOW_PER * 3);
  const aColor = new Float32Array(n * GLOW_PER * 3);
  const aSeed = new Float32Array(n * GLOW_PER);
  const aAlive = new Float32Array(n * GLOW_PER).fill(1);
  live.forEach((t, i) => {
    // a warm glint, whatever the thing's own colour: it is what the eye catches from across the snow
    const c = new THREE.Color(t.item.tint).lerp(new THREE.Color(1.0, 0.72, 0.34), 0.6);
    for (let k = 0; k < GLOW_PER; k++) {
      const j = i * GLOW_PER + k;
      aCenter.set([t.x, t.y, t.z], j * 3);
      aColor.set([c.r, c.g, c.b], j * 3);
      aSeed[j] = (j * 0.6180339887) % 1;
    }
  });
  const glowGeometry = dabGeometry(n * GLOW_PER, {
    aCenter: [aCenter, 3], aColor: [aColor, 3], aSeed: [aSeed, 1], aAlive: [aAlive, 1],
  }, true);
  const glow = dabMesh(glowGeometry, dabMaterial(shared, {
    head: /* glsl */ `in vec3 aCenter; in vec3 aColor; in float aSeed; in float aAlive;`,
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        if (aAlive < 0.5) { d.alive = 0.0; return; }
        float t = uTime * 0.7 + aSeed * TAU;
        float rise = fract(uTime * 0.09 + aSeed * 7.13);      // one stroke climbs and goes out, again and again
        float swing = 0.05 + 0.035 * fract(aSeed * 3.7);
        d.pos = aCenter + vec3(cos(t) * swing, 0.07 + rise * 0.36, sin(t) * swing);
        d.dir = vec3(0.0, 1.0, 0.0);
        d.size = vec2(0.038, 0.075) * (0.55 + 0.9 * (1.0 - rise));
        float fade = sin(rise * 3.14159);
        d.c1 = aColor * (0.22 + 0.95 * fade);
        d.c2 = aColor * (0.34 + 1.35 * fade);
        d.seed = aSeed * 97.0;
        d.lift = 0.0;
      }`,
    minPx: [2, 3], maxPx: [110, 220], cells: [0, 6],
  }), 21);
  glow.material.transparent = true;
  glow.material.blending = THREE.AdditiveBlending;
  glow.material.alphaToCoverage = false;
  glow.material.depthWrite = false;
  scene.add(glow);
  const aliveAttr = glowGeometry.getAttribute('aAlive');

  let input = null;
  const book = ui ? createBook({
    sceneName: name, items, found,
    other: [['aurora', '极光雪岭'], ['autumn', '秋日林间']]
      .filter(([k]) => k !== name)
      .map(([k, zh]) => ({ key: k, zh, total: (TREASURES[k] ?? []).length })),
    onOpen() { if (input) { input.lockable = false; input.mouse.drag = false; } },
    onClose() { if (input) input.lockable = true; },
  }) : null;

  function collect(t) {
    if (t.got) return;
    t.got = true;
    t.group.visible = false;
    if (t.pins) t.pins.visible = false;
    const i = live.indexOf(t);
    for (let k = 0; k < GLOW_PER; k++) aAlive[i * GLOW_PER + k] = 0;
    aliveAttr.needsUpdate = true;
    found.add(t.item.id);
    const saved = readFound();
    saved[name] = [...found];
    writeFound(saved);
    book?.refresh();
    book?.flash(t.item.zh, t.item.en);
  }

  return {
    itemCount: items.length,
    found,
    book,
    get isOpen() { return book?.isOpen ?? false; },
    /** E opens the catalogue; while it is open nothing of the walk gets through. */
    freeze(inp) {
      inp.move.x = inp.move.y = 0;
      inp.look.x = inp.look.y = 0;
      inp.zoom = 0;
      inp.jump = false;
      inp.sprint = false;
      return inp;
    },
    setInput(i) { input = i; },
    update(dt, feet) {
      for (const t of live) {
        if (t.got) continue;
        const dx = feet.x - t.x, dz = feet.z - t.z;
        if (dx * dx + dz * dz < REACH * REACH && Math.abs(feet.y - t.y) < 2.5) collect(t);
      }
    },
    /** For the tools and the checks: everything and where it is, and picking one up without walking there. */
    list() {
      return items.map((i) => {
        const t = live.find((x) => x.item === i);
        return { id: i.id, zh: i.zh, en: i.en, got: found.has(i.id), x: t ? t.x : i.at[0], y: t ? t.y : null, z: t ? t.z : i.at[1] };
      });
    },
    at(id) {
      const t = live.find((x) => x.item.id === id);
      return t ? { x: t.x, y: t.y, z: t.z } : null;
    },
    take(id) {
      const t = live.find((x) => x.item.id === id);
      if (t) collect(t);
      return !!t;
    },
    reset() {
      const saved = readFound();
      delete saved[name];
      writeFound(saved);
      const keep = [...found].filter((id) => !items.some((i) => i.id === id));
      found.clear();
      for (const id of keep) found.add(id);
      book?.refresh();
    },
  };
}
