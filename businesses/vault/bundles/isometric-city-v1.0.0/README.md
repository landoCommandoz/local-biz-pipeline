# Brewington Isometric City — Three.js Starter

A ready-to-run Three.js scene built on Kenney's CC0 Isometric City pack. 128 sprites pre-positioned, camera controls configured, scene loader included, grid placement helper ready.

## Quick start

1. Unzip this archive into a folder.
2. Serve the folder over a local HTTP server (Three.js cannot load local files via `file://`):
   ```bash
   # any of these work
   python3 -m http.server 8000
   npx http-server -p 8000
   ```
3. Open `http://localhost:8000` in your browser.

That is it. No build step, no bundler, no npm install.

## What you get

- Working Three.js scene (ES modules via importmap, no bundler required)
- 128 Kenney Isometric City sprites at `assets/sprites/cityTiles_000.png through cityTiles_141.png (128 files, gaps in numbering are normal)`
- Pre-rendered in true isometric view by Kenney
- Orthographic iso camera with 30° tilt and 45° rotation (the real iso math)
- OrbitControls tuned for iso: constrained polar angle, pan-and-zoom only within iso bounds
- Grid-to-world coordinate helper so you can write `placeSprite(filename, gridX, gridZ)` and forget the math
- Sprite cache so each PNG is loaded exactly once
- Pixel-perfect sampling (nearest-neighbor filter) so sprites do not smear when zoomed
- SRGB color space on textures so the palette stays true
- Responsive canvas with correct aspect-ratio handling on window resize
- Clean global API: `window.BrewingtonIso` exposes `scene`, `camera`, `placeSprite`, etc.

## File tree

```
brewington-isometric-city-threejs-starter/
├── index.html          Entry point, loads three and scene.js
├── js/
│   └── scene.js        The whole starter. 200 lines, commented.
├── assets/
│   └── sprites/        142 Kenney Isometric City PNGs
├── LICENSE.txt         Brewington commercial-use terms for the integration code
├── KENNEY-CC0-NOTICE.txt  Kenney's CC0 notice, preserved per license
└── README.md           This file
```

## Architecture walkthrough

`js/scene.js` does five things in order. Read the file from top to bottom and it reads like a tutorial.

1. **Scene setup.** Creates a Three.js scene with a dark space background (change `scene.background` to recolor). Adds an orthographic camera positioned at `(15, 15, 15)` looking at the origin — that is the canonical iso angle. Adds ambient and directional lights.

2. **Ground grid.** A `THREE.GridHelper` at y = -0.5 so you can see the grid your sprites sit on. Set its visibility to false in production, or restyle for your theme.

3. **Sprite loader.** A tiny loader function that caches sprites in a `Map`, applies nearest-neighbor filtering (avoids blur), and returns a `THREE.SpriteMaterial`. All sprites share the same loader so memory stays flat.

4. **Grid helpers.** `gridToWorld(gx, gz)` converts grid coords to scene coords at a configurable tile size (default 2 units per tile). `placeSprite(filename, gx, gz, opts)` places a sprite at a grid coordinate with an optional y-offset (buildings sit higher than roads) and optional scale.

5. **Demo layout.** An array of `[filename, gridX, gridZ, opts]` tuples drives the demo city. Replace this with your own. The sprites are named `cityTiles_000.png through cityTiles_141.png (128 files, gaps in numbering are normal)`. Most roads are around 080-100, most buildings are 020-070, decoration is scattered through the rest. Open the `assets/sprites/` folder and scroll through to pick the look you want.

## Common customizations

### Change the palette
Edit `scene.background` in scene.js. Try `new THREE.Color(0x1a1f3a)` for indigo night, or `new THREE.Color(0xf2ede3)` for bone daylight.

### Add your own sprites
Drop your PNGs into `assets/sprites/`, then reference them by filename in `placeSprite`. Kenney's CC0 license allows remixing, you can even repaint the sprites.

### Hide the grid
```js
grid.visible = false;
```

### Generate a texture atlas for performance
For very large cities (500+ sprites) you will want a texture atlas to reduce draw calls. This starter loads one texture per sprite, which is fine for up to a few hundred. See the Three.js docs on `TextureLoader` and `MeshBasicMaterial` with shared texture atlases for the upgrade path.

### Save and load layouts
The sprite positions are just JavaScript. Serialize your layout as JSON, save to localStorage or a server, load back on startup. The `demoLayout` array is the pattern.

### Use with React or Vue
Wrap the whole thing in a component that mounts to a ref. Do not let React manage Three.js objects — let Three.js own the canvas, React just mounts a div and calls `new IsoScene(div)`. The pattern is called escape hatch: React handles UI, Three handles the canvas.

## Licensing

- **The code** (index.html, scene.js, README, and any other Brewington-authored file) is licensed under the terms in `LICENSE.txt`. Commercial use is permitted. Redistributing the starter as-is is not permitted (buy your own copy).
- **The sprites** (everything under `assets/sprites/`) are Kenney CC0, see `KENNEY-CC0-NOTICE.txt`. Free for personal and commercial use, no attribution required, though crediting Kenney is generous.

## Compatibility

- Three.js r150 and up (tested against r160)
- Any modern browser (Chrome, Firefox, Safari, Edge)
- Mobile browsers work, touch is handled by OrbitControls
- No IE, no Safari below 15

## Support

This is a one-time purchase, not a subscription. No bug-fix guarantee, but issues filed on the Itch.io discussion board get answered within a week when possible.

If you built something fun with this, share it on the Itch project page or tag @brewingtondigital on any social channel, we would love to see it.

## Credits

- **Kenney** (kenney.nl) for the isometric city art, released as CC0
- **Three.js** team for the engine
- **Brewington Digital** (brewingtondigital.com) for the integration work you just bought

Ships by Brewington Digital. Thanks for supporting indie tooling.
