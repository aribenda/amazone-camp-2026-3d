# Architecture

## System Design

This is a static web app built with Vite and Three.js. The app renders a 3D representation of the AmaZONE Camp 2026 layout in the browser and deploys as Cloudflare Worker static assets.

The system has three layers:

1. Static assets in `public/`.
2. Source code in `src/`.
3. Cloudflare deployment config in `wrangler.toml`.

## Main Components

### `src/campLayout.js`

Defines:

- Camp dimensions.
- Feet-to-world scale.
- Source reference map settings.
- Legend names.
- Display labels.
- Section geometry data.

### `src/main.js`

Owns:

- Three.js scene, camera, renderer, and lights.
- Ground plane and reference map setup.
- Camp section creation.
- Pointer lock controls.
- Mobile controls.
- Click selection and highlighting.
- Rotating labels.
- Music playback behavior.
- Animation loop.

### `src/objects/builders.js`

Owns:

- Geometry builders for camp sections.
- Procedural yurt, RV, tent, dome, and structure placeholders.
- GLB loading and placement for car models.
- Shared material helpers.

### `src/objects/textLabels.js`

Creates visible section labels.

### `public/`

Contains:

- Source map image.
- Audio asset.
- GLB model assets.

### `wrangler.toml`

Configures Cloudflare Worker static asset deployment from `./dist`.

## Data Flow

1. `src/main.js` imports camp data from `src/campLayout.js`.
2. For each section in `sections`, `createCampSection()` in `src/objects/builders.js` builds a Three.js group.
3. Main scene adds each group and registers meshes/sprites as clickable objects.
4. User input updates camera position or camera rotation.
5. Raycasting maps clicks to section metadata.
6. Vite bundles source into `dist/`.
7. Wrangler uploads `dist/` to Cloudflare.

## Integrations

### GitHub

GitHub repository: `aribenda/amazone-camp-2026-3d`.

GitHub is the source of truth for code and project docs.

### Cloudflare

Cloudflare serves the production app as a Worker with static assets.

Known deployment command:

```bash
npx wrangler deploy
```

### Browser Audio

The app uses an HTML audio element for background music. Unmuted autoplay may be blocked until user interaction.

## Local Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Deploy:

```bash
npx wrangler deploy
```
