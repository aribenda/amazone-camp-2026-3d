# Project Memory

## Owner

Owner: Ariel David / GitHub user `aribenda`.

## Long-Term Project Goals

- Create a walkable 3D planning model of AmaZONE Camp 2026.
- Keep the layout faithful to the source camp plan.
- Use the model as a practical camp planning and communication tool.
- Improve visual realism incrementally, especially for yurts, vehicles, RVs, and camp structures.
- Keep the codebase understandable enough for multiple AI agents and humans to work on safely.

## Important Constraints

- Overall camp size is 250 ft wide by 200 ft deep.
- Scale is `1 ft = 0.1 Three.js units`.
- The source layout is `public/Amazone Camp 2026 Layout.jpeg`.
- Layout data should remain centralized in `src/campLayout.js`.
- Reusable object builders should live in `src/objects/`.
- The project should remain deployable to Cloudflare.
- Work locally until the owner explicitly asks to publish.
- GitHub is the source of truth for published code.
- Do not commit duplicate root-level media files unless they are actually used.
- The untracked root file `Tribal Journey.mp3` is a duplicate of the app asset and should not be staged unless the owner asks.

## Preferred Tools

- Vite for local development and builds.
- Three.js for rendering.
- `GLTFLoader` for `.glb` and `.gltf` models.
- Cloudflare Workers static assets via Wrangler for deployment.
- GitHub for source control.
- `npm run build` for validation before deploy or commit.
- Browser inspection or local screenshots for visual validation when changing layout or 3D assets.

## Important Decisions

- Keep the project as a real Vite/Three.js codebase rather than switching to a one-shot web generator.
- Use external `.glb` model assets for realistic vehicles instead of hand-building cars from boxes.
- Keep procedural geometry for lower-priority structures until better assets are available.
- Remove the password gate during active local testing.
- Keep music as a browser audio element with autoplay attempt plus user-triggered fallback, because browsers often block unmuted autoplay.
- Deploy current production manually with `npx wrangler deploy` when Cloudflare GitHub builds do not become active.

## Things Future Agents Must Know

- Read `AGENTS.md` before editing.
- Read all project docs before editing.
- Never work directly on `main`.
- Before changing layout, understand that `src/campLayout.js` uses feet and converts to Three.js units with `feet()` and `feetToWorld()`.
- Car parking currently uses model files in `public/models/`.
- Yurts and RVs are still placeholders and are likely future improvement areas.
- Cloudflare dashboard may show GitHub builds that succeed but do not become active deployments. Wrangler deploy has successfully made versions active.
- The latest known successful Cloudflare active deploy used Wrangler after commit `e95cd75`.
- Always check `git status -sb`, current branch, and recent commits before editing.
