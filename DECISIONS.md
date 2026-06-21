# Decisions

## 2026-06-21: Use Vite + Three.js

Decision: Build the camp renderer as a Vite app using Three.js.

Why: Vite gives a simple web development workflow, and Three.js is the right low-level rendering layer for a custom walkable camp map.

## 2026-06-21: Use 1 ft = 0.1 Three.js Units

Decision: Use `1 ft = 0.1 Three.js units`.

Why: This keeps the 250 ft by 200 ft camp at a manageable scene size while preserving intuitive layout math.

## 2026-06-21: Centralize Layout Data

Decision: Keep camp dimensions, legend entries, labels, and section coordinates in `src/campLayout.js`.

Why: Future agents need one source of truth for placement and scale.

## 2026-06-21: Keep Object Builders Reusable

Decision: Put reusable geometry and model builders in `src/objects/`.

Why: The project will evolve from placeholders to realistic assets, and object creation needs to stay modular.

## 2026-06-21: Use GLB Assets for Realistic Vehicles

Decision: Use `.glb` files in `public/models/` for car parking instead of constructing cars from boxes and cylinders.

Why: Procedural box cars looked toy-like and were not acceptable for the visual goal. Real model assets are faster and better.

## 2026-06-21: Keep Yurts and RVs Procedural for Now

Decision: Keep yurts and RVs procedural placeholders until better assets are chosen.

Why: The current priority is layout and navigation. Replacing every object with models should happen incrementally.

## 2026-06-21: Remove Password Gate During Local Testing

Decision: Disable the password gate while iterating locally.

Why: The owner wanted fast testing without entering a password every reload.

## 2026-06-21: Add Music as a Static Audio Asset

Decision: Use `public/audio/tribal-journey.mp3` as an HTML audio element with play/pause control.

Why: It is simple, deployable, and browsers can stream the MP3. Browser autoplay restrictions still apply.

## 2026-06-21: Use Wrangler for Active Cloudflare Deployments

Decision: Use `npx wrangler deploy` when the Cloudflare dashboard shows GitHub builds that do not become active.

Why: Wrangler deploy successfully created the active Worker deployment, while the GitHub build history entry did not become active in the observed dashboard state.

## 2026-06-21: Add Multi-Agent Collaboration Docs

Decision: Add project memory, status, tasks, decisions, architecture, runbook, and agent rules.

Why: The owner wants the repository to be safe and understandable for multiple AI agents.
