/**
 * Isometric City Starter — Three.js scene
 *
 * Loads 128 of Kenney's Isometric City sprites as billboards on an isometric grid.
 * Provides:
 *   - true-isometric orthographic camera (30° tilt, 45° rotation)
 *   - OrbitControls tuned for iso view (constrained elevation)
 *   - grid-to-world coordinate helper for placing sprites
 *   - sprite cache so each PNG is loaded exactly once
 *   - a demo layout you can replace with your own
 *
 * Replace the demo layout at the bottom of this file to build your own city.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Scene setup ----------

const container = document.getElementById('canvas-wrap');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);

// Isometric orthographic camera. Width/height derived from window aspect so
// sprites keep their pixel proportions across resizes.
const frustumSize = 18;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000
);
// Classic iso: camera at elevated 45° sideways, looking down 30°
camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Soft ambient plus directional so sprites pop slightly
scene.add(new THREE.AmbientLight(0xf2ede3, 0.85));
const sun = new THREE.DirectionalLight(0xf7c873, 0.45);
sun.position.set(5, 12, 5);
scene.add(sun);

// Ground grid so the iso plane reads
const grid = new THREE.GridHelper(40, 40, 0x3a4663, 0x1a1f3a);
grid.position.y = -0.5;
scene.add(grid);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minZoom = 0.5;
controls.maxZoom = 3;
controls.minPolarAngle = Math.PI / 6;
controls.maxPolarAngle = Math.PI / 3;
controls.screenSpacePanning = false;
controls.target.set(0, 0, 0);

// ---------- Sprite loader ----------

const loader = new THREE.TextureLoader();
const spriteCache = new Map();

/**
 * Load a Kenney sprite PNG and return a Three.js Sprite positioned at (gridX, gridZ).
 * tileSize defines how many world units one sprite occupies (default 2).
 */
async function loadSprite(filename) {
  if (spriteCache.has(filename)) return spriteCache.get(filename);
  const texture = await loader.loadAsync(`./assets/sprites/${filename}`);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  spriteCache.set(filename, material);
  return material;
}

/**
 * Grid-to-world helper. Converts (gridX, gridZ) integer coords to scene coords.
 * Origin (0,0) is the center of the ground plane.
 */
function gridToWorld(gridX, gridZ, tileSize = 2) {
  return { x: gridX * tileSize, z: gridZ * tileSize };
}

/**
 * Place a Kenney sprite at a grid position.
 * Each sprite is a Three.js Sprite, so it always faces the camera. For
 * true-isometric the sprite's natural art already reads correctly because
 * Kenney pre-rendered them from the iso angle.
 */
async function placeSprite(filename, gridX, gridZ, opts = {}) {
  const material = await loadSprite(filename);
  const sprite = new THREE.Sprite(material);
  const { x, z } = gridToWorld(gridX, gridZ);
  const yOffset = opts.yOffset ?? 1;
  const scale = opts.scale ?? 2;
  sprite.position.set(x, yOffset, z);
  sprite.scale.set(scale, scale, scale);
  scene.add(sprite);
  return sprite;
}

// ---------- Demo layouts ----------
// Three layouts ship with the starter. Switch via the URL hash:
//   /?layout=default   small working demo
//   /?layout=dense     busy downtown grid
//   /?layout=suburb    sparse residential blocks

const LAYOUTS = {
  default: [
    ['cityTiles_087.png',  0, 0],
    ['cityTiles_087.png',  1, 0],
    ['cityTiles_087.png', -1, 0],
    ['cityTiles_087.png',  0, 1],
    ['cityTiles_087.png',  0, -1],
    ['cityTiles_026.png',  2, 1, { yOffset: 1.5 }],
    ['cityTiles_046.png', -2, 1, { yOffset: 1.5 }],
    ['cityTiles_022.png',  2, -1, { yOffset: 1.5 }],
    ['cityTiles_027.png', -2, -1, { yOffset: 1.5 }],
    ['cityTiles_076.png',  3, 0, { yOffset: 1.2 }],
    ['cityTiles_093.png', -3, 0, { yOffset: 1.2 }],
    ['cityTiles_015.png',  0, 3, { yOffset: 1.2 }],
    ['cityTiles_082.png',  0, -3, { yOffset: 1.2 }]
  ],
  dense: [
    // 5x5 of roads + mixed buildings
    ...Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => (
      [(i + j) % 3 === 0 ? 'cityTiles_087.png' : 'cityTiles_085.png', i - 2, j - 2]
    ))).flat(),
    ['cityTiles_026.png',  3,  3, { yOffset: 2.2, scale: 2.5 }],
    ['cityTiles_046.png', -3,  3, { yOffset: 2.2, scale: 2.5 }],
    ['cityTiles_022.png',  3, -3, { yOffset: 2.2, scale: 2.5 }],
    ['cityTiles_027.png', -3, -3, { yOffset: 2.2, scale: 2.5 }],
    ['cityTiles_034.png',  0,  0, { yOffset: 1.8, scale: 2 }],
    ['cityTiles_076.png',  2,  0, { yOffset: 1.3 }],
    ['cityTiles_093.png', -2,  0, { yOffset: 1.3 }],
    ['cityTiles_015.png',  0,  2, { yOffset: 1.3 }],
    ['cityTiles_082.png',  0, -2, { yOffset: 1.3 }],
    ['cityTiles_103.png',  1,  1, { yOffset: 1.4 }],
    ['cityTiles_100.png', -1, -1, { yOffset: 1.4 }],
    ['cityTiles_101.png',  1, -1, { yOffset: 1.4 }]
  ],
  suburb: [
    // sparse grid, houses spread apart with greenery between
    ['cityTiles_085.png',  0, 0],
    ['cityTiles_085.png',  2, 0],
    ['cityTiles_085.png', -2, 0],
    ['cityTiles_085.png',  0, 2],
    ['cityTiles_085.png',  0, -2],
    ['cityTiles_085.png',  2, 2],
    ['cityTiles_085.png', -2, -2],
    ['cityTiles_085.png',  2, -2],
    ['cityTiles_085.png', -2, 2],
    ['cityTiles_046.png',  3,  3, { yOffset: 1.5 }],
    ['cityTiles_027.png', -3,  3, { yOffset: 1.5 }],
    ['cityTiles_022.png',  3, -3, { yOffset: 1.5 }],
    ['cityTiles_026.png', -3, -3, { yOffset: 1.5 }],
    ['cityTiles_015.png',  3,  0, { yOffset: 1.2 }],
    ['cityTiles_015.png', -3,  0, { yOffset: 1.2 }]
  ]
};

function getLayoutFromURL() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('layout') || 'default';
  return LAYOUTS[name] || LAYOUTS.default;
}

const demoLayout = getLayoutFromURL();

async function buildDemo() {
  const loading = document.getElementById('loading');
  for (const [file, gx, gz, opts] of demoLayout) {
    try {
      await placeSprite(file, gx, gz, opts);
    } catch (err) {
      console.warn('sprite load failed', file, err.message);
    }
  }
  loading.classList.add('hidden');
}

// ---------- Resize + animate ----------

window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left = (-frustumSize * a) / 2;
  camera.right = (frustumSize * a) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

buildDemo();
animate();

// ---------- Export the API for buyers to extend from ----------
window.BrewingtonIso = {
  scene, camera, renderer, controls,
  placeSprite, gridToWorld, loadSprite,
  spriteCache
};
