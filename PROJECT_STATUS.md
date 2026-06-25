# Project Status

## Last Updated

2026-06-25

## Current Phase

Interactive prototype visual refinement.

## Completed

- Created Vite + Three.js camp walkthrough.
- Added playa ground plane and camp boundary.
- Added semi-transparent 2D reference map.
- Added desktop WASD + mouse controls.
- Added mobile/touch controls.
- Added clickable camp sections with legend names.
- Added rotating area labels.
- Added procedural placeholders for the camp sections.
- Added procedural silver-ish yurts.
- Added improved placeholder RVs.
- Added GLB car models for the car parking area.
- Added background music and play/pause control.
- Published current app code to GitHub.
- Deployed the current app to Cloudflare with Wrangler.
- Added multi-agent documentation and collaboration workflow.
- Added the supplied `Amazone Portal.glb` model as the 3D entrance portal.
- Removed the vertical poles under floating section labels.
- Added a procedural cracked-playa ground texture with bump/roughness maps while preserving delimiter overlays.
- Replaced the school bus and DJ booth placeholders with supplied GLB models.
- Added the supplied `BM man 2026.glb` as an off-camp Burning Man landmark visible from the portal route.
- Repositioned the Man landmark about 200 ft beyond the camp boundary and shifted it along the side boundary to align with the requested crosshair position.
- Added a welcome/instruction overlay, reset-position control, fullscreen control, and Shift sprint behavior.
- Restyled the welcome overlay with the borderless AmaZONE sign image, a matching purple-blue sign background, stacked `Camp 2026` text, and cleaner aligned control instructions.
- Expanded the walkable playa bounds so visitors can reach the Man without opening the whole world too broadly.
- Added simple circular collision around the Man trunk.

## In Progress

- Improving visual realism while preserving layout accuracy.
- Tuning car, RV, yurt, and camp-object placement based on visual review.
- Reviewing the cracked-playa ground texture visually in browser; crack repeat scale was reduced after the first pass looked too large.
- Reviewing the school bus and DJ booth GLB scale/orientation in browser.
- Reviewing the new GLB entrance portal visually in browser.
- Reviewing the Man landmark visually in a normal desktop browser, especially final rotation/front-facing direction.
- Clarifying Cloudflare GitHub build versus active deployment behavior.

## Broken or Risky

- Cloudflare GitHub builds can show success without becoming the active deployment.
- RVs are still procedural placeholders and may need real GLB assets later.
- Yurts are still procedural and may not fully match the real silver yurt photos.
- Music autoplay may be blocked by browsers until the user clicks or presses a key.
- The root-level `Tribal Journey.mp3` is untracked and duplicates the published audio asset.
- Large media/model files increase deploy size and load time.
- `BM man 2026.glb` is about 23.9 MB, close to Cloudflare's 25 MB single-asset limit.
- In-app screenshot capture timed out against the WebGL canvas during automated testing, so visual review should still be done manually in a desktop browser.

## Next Priority

Review the far Man landmark behind the dome in a normal desktop browser, then tune `MAN_POSITION`, `MAN_ROTATION`, or `MAN_SCALE` if needed.

## Open Questions

- Should Cloudflare production be driven by GitHub auto-deploys only, Wrangler deploys only, or both?
- Should the untracked root `Tribal Journey.mp3` be deleted, ignored, or kept as a local source file?
- Which yurt/RV assets should replace the procedural placeholders?
- What is the acceptable initial load time with music and GLB models included?
- Should `BM man 2026.glb` be optimized later to reduce load time, or kept at full exported quality for now?
