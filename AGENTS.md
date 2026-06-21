# Agent Collaboration Rules

These rules apply to every AI agent and human collaborator working in this repository.

## Required Rules

1. GitHub is the source of truth.
2. Every agent must read all project docs before making changes:
   - `README.md`
   - `PROJECT_MEMORY.md`
   - `PROJECT_STATUS.md`
   - `TASKS.md`
   - `DECISIONS.md`
   - `ARCHITECTURE.md`
   - `RUNBOOK.md`
   - `AGENTS.md`
3. Every agent must work on a separate branch.
4. No agent should work directly on `main`.
5. Branch names should use:
   - `codex/<task-name>`
   - `claude/<task-name>`
   - `human/<task-name>`
6. Every agent must check git status, current branch, and recent commits before editing:
   - `git status -sb`
   - `git branch --show-current`
   - `git log -5 --oneline`
7. Every agent must summarize its understanding before starting.
8. Every agent must update `PROJECT_STATUS.md` and `TASKS.md` before finishing.
9. Every agent must add important decisions to `DECISIONS.md`.
10. Every agent must summarize changes before committing.
11. If unclear, the agent must stop and add the question to `PROJECT_STATUS.md` under Open Questions.

## Working Agreement

- Keep changes scoped to the requested task.
- Do not delete or overwrite work from another branch or agent.
- Do not stage unrelated local files.
- Do not publish or deploy unless the owner explicitly asks.
- Run `npm run build` before committing code changes.
- For visual changes, test locally in a browser when possible.
- Prefer real `.glb` assets for realistic objects instead of complex procedural placeholder geometry.
- Keep layout math in feet and convert through the existing helpers.

## Project-Specific Warnings

- The root-level `Tribal Journey.mp3` is currently local-only and untracked. Do not stage it unless the owner explicitly requests it.
- The deployed app uses `public/audio/tribal-journey.mp3`.
- Cloudflare GitHub builds may not automatically become active deployments. Use `RUNBOOK.md` for the current deployment process.
- The camp layout must remain faithful to the 250 ft by 200 ft source plan.
