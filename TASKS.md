# Tasks

## Active Tasks

1. Fix or confirm the Cloudflare deployment workflow so GitHub pushes become active deployments, or document Wrangler as the release process.
2. Review the Man landmark visually from the portal, halfway point, and close-up; tune the constants in `src/main.js` if needed.
3. Review the cracked-playa ground texture after reducing crack scale and tune contrast if needed.
4. Review the school bus and DJ booth GLB scale/orientation in browser.
5. Review the new GLB entrance portal visually and tune scale/orientation against the reference image.
6. Improve RV visuals, preferably by replacing procedural RVs with GLB assets.
7. Improve yurt visuals to better match the provided silver yurt reference photos.
8. Tune mobile controls and verify the experience on real phones.
9. Review performance impact of GLB models and the 19 MB audio file.

## Backlog

- Add a debug teleport or camera preset for quickly reviewing specific camp sections.
- Add better lighting and atmosphere without sacrificing usability.
- Add dust, sky, and playa environmental effects.
- Add more realistic structures for lounge, kitchen, bars, and generator.
- Add model attribution/license documentation for third-party GLB assets.
- Add asset compression pipeline for GLB and audio.
- Add a visible loading state for models and audio.
- Add optional password gate again when public sharing requires it.
- Add automated smoke tests for build and asset availability.
- Add model attribution/license documentation for `Amazone Portal.glb` if needed.
- Optimize `BM man 2026.glb` if real-world load time is too slow or Cloudflare deploy limits become tight.

## Completed Tasks

- Build initial Vite + Three.js app.
- Add source camp map as ground reference.
- Implement first-person desktop movement.
- Implement mobile/touch movement.
- Add clickable camp sections.
- Add section labels.
- Add procedural yurts.
- Add music.
- Add GLB car models.
- Tune car parking count, spacing, and scale.
- Improve RV placeholder geometry.
- Push current app to GitHub.
- Deploy current app to Cloudflare with Wrangler.
- Add multi-agent project docs and workflow files.
- Replace procedural entrance portal with supplied `Amazone Portal.glb`.
- Remove vertical poles from floating section labels.
- Add procedural cracked-playa ground texture while keeping delimiter lines/reference overlays visible.
- Replace school bus and DJ booth placeholders with supplied GLB models.
- Add supplied `BM man 2026.glb` as a walkable off-camp landmark.
- Add welcome overlay, reset-position control, fullscreen control, and Shift sprint.
- Restyle the welcome overlay with the supplied AmaZONE sign image and aligned controls.
