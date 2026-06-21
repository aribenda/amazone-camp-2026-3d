# AmaZONE Camp 2026 3D Walkthrough

## Project Name

AmaZONE Camp 2026 3D Walkthrough

## Objective

Build a walkable 3D web rendering of the AmaZONE Burning Man camp using Three.js, based on the provided camp layout image and legend.

## Who It Is For

This project is for AmaZONE camp organizers, builders, campmates, and invited collaborators who need to understand the camp layout spatially before arriving on playa.

## Problem It Solves

The 2D camp plan is useful, but it is hard to feel distances, scale, adjacency, and navigation from a flat image. This app turns the plan into a navigable 3D scene so people can walk through the camp, understand where major areas are, and iterate on placement decisions visually.

## Main Features

- Vite-based Three.js web app.
- Camp scale uses `1 ft = 0.1 Three.js units`.
- Flat playa ground plane with a semi-transparent 2D reference map on the ground.
- First-person desktop navigation with WASD and mouse pointer lock.
- Touch/mobile controls for basic movement and looking.
- Clickable numbered camp sections that show the legend name.
- Rotating 3D-style labels for camp areas.
- Procedural placeholder geometry for camp infrastructure, yurts, shiftpods, RVs, and structures.
- GLB model loading for car parking assets.
- Background music from `public/audio/tribal-journey.mp3` with a play/pause control.
- Cloudflare static assets deployment through `wrangler.toml`.

## Current Scope

The project is an interactive planning and visualization prototype. It is not intended to be photorealistic yet. The priority is accurate layout, approximate scale, easy navigation, and a codebase that future agents can safely improve.

The current visual fidelity is mixed:

- Car parking uses real `.glb` model assets.
- Yurts use procedural silver-ish placeholder geometry.
- RVs use improved but still placeholder geometry.
- Most other camp sections remain simple boxes, cylinders, canopies, tents, domes, or labels.

## Success Criteria

The project is successful when:

- A user can open the site and immediately understand the AmaZONE camp layout.
- Distances and object placement feel consistent with the 250 ft by 200 ft plan.
- Core areas are labeled and clickable.
- Desktop and mobile navigation both work well enough for review.
- The app can be deployed reliably to Cloudflare.
- Multiple AI agents can safely contribute without overwriting each other or losing project context.

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

## Deploy

```bash
npx wrangler deploy
```

The `wrangler.toml` file publishes the Vite `dist` folder as Cloudflare Worker static assets.

## Important Files

- `src/campLayout.js`: camp dimensions, legend, section data, and layout coordinates.
- `src/main.js`: Three.js scene setup, controls, interaction, music, and render loop.
- `src/objects/builders.js`: reusable object builders and GLB model loading.
- `src/objects/textLabels.js`: rendered section labels.
- `public/Amazone Camp 2026 Layout.jpeg`: source reference map.
- `public/models/`: GLB model assets.
- `public/audio/`: audio asset used by the site.
- `wrangler.toml`: Cloudflare deployment config.
