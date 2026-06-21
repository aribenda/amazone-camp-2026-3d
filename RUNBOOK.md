# Runbook

## Run the Project Locally

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173/
```

If that port is busy, Vite may choose another port.

## Test the Project

Run the production build:

```bash
npm run build
```

Manual smoke test:

1. Open the local site.
2. Confirm the scene renders.
3. Click into the canvas on desktop and verify pointer lock.
4. Use `W`, `A`, `S`, `D` to move.
5. Click objects or labels and verify section names update.
6. Check car parking models load.
7. Check music button appears and can play/pause.
8. On mobile or narrow viewport, verify touch controls appear.

## Troubleshooting

### Local Page Refuses Connection

The Vite dev server is probably not running.

Run:

```bash
npm run dev
```

Then use the exact URL shown by Vite.

### Models Do Not Appear

Check:

- Model files exist in `public/models/`.
- The paths in `src/objects/builders.js` start with `/models/`.
- Browser console has no GLB loading errors.
- `npm run build` passes.

### Music Does Not Autoplay

This is usually browser policy. Unmuted autoplay is often blocked.

Expected behavior:

- The app tries to autoplay.
- If blocked, clicking or pressing a key should try playback again.
- The play/pause button should still work.

### Cloudflare Shows GitHub Build Succeeded But Active Deployment Is Old

This has happened before. Use Wrangler to deploy the built app directly:

```bash
npm run build
npx wrangler deploy
```

Then check the Cloudflare Deployments tab for a new active Wrangler deployment.

### Large Assets Slow the Site

Current large assets include:

- `public/audio/tribal-journey.mp3`
- GLB files in `public/models/`

Future improvement: compress audio and optimize GLB files.

## Deploy

Build:

```bash
npm run build
```

Deploy:

```bash
npx wrangler deploy
```

Expected output includes:

- Worker name: `amazone-camp-2026-3d`
- Workers.dev URL
- Current Version ID

## GitHub Workflow

Do not work directly on `main`.

Create a branch:

```bash
git checkout -b codex/<task-name>
```

Before finishing:

```bash
npm run build
git status -sb
```

Commit with a clear message.

Push only when the owner asks to publish or review remotely.
