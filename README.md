# AmaZONE Camp 2026 Walkthrough

A Vite + Three.js walkable 3D rendering of the AmaZONE Burning Man camp layout.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Cloudflare Pages settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## Layout

Camp dimensions use `1 ft = 0.1 Three.js units`. Layout data is centralized in `src/campLayout.js`; reusable geometry builders live in `src/objects/`.
