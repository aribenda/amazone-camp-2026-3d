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

## 2026-06-23: Build the Entrance Portal Procedurally First

Decision: Replace the simple entrance portal with procedural Three.js geometry inspired by the supplied reference image.

Why: A procedural portal can be iterated quickly inside the existing codebase, keeps the entrance in the exact layout position, and avoids waiting for a custom GLB model. If the result is not strong enough visually, a future task can replace it with a dedicated model asset.

## 2026-06-23: Use Supplied GLB for Entrance Portal

Decision: Replace the procedural entrance portal with `public/models/Amazone Portal.glb`.

Why: The owner supplied a dedicated portal model, which should provide better visual fidelity than procedural geometry while keeping placement controlled by the existing camp layout.

## 2026-06-24: Generate Playa Ground Texture Procedurally

Decision: Use code-generated canvas textures for the cracked playa floor instead of adding another image asset.

Why: Procedural color, bump, and roughness maps keep the texture repeatable across the whole virtual world, avoid another external asset dependency, and preserve existing delimiter lines/reference overlays above the ground.

## 2026-06-24: Use Supplied GLB Models for Bus and DJ Booth

Decision: Replace the bus and DJ booth placeholder geometry with `yellow_school_bus.glb` and `dj booth.glb`.

Why: Supplied GLB assets provide better visual fidelity than simple boxes while preserving placement and scale through the existing camp layout data.
