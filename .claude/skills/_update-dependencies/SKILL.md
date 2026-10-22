---
name: update-dependencies
description: Update the repo's outdated npm dependencies — every workspace package to latest, peer ranges fixed, tree left dirty for review. Can reset + reinstall and run lint + tests afterward, opt-in up front. Scoped to npm packages only — agent skills are updated by `_update-skills` (or both together via `_update-third-parties`). Use as "/update-dependencies" or when asked to update, bump, or refresh the project's npm dependencies.
model: sonnet
effort: medium
---

# Update dependencies

Bring the repo's npm dependencies up to date. Do the steps in order; stop and surface any failure.

## 1. Ask what to run afterward

Ask this **first**, before touching anything, so the rest of the run is unattended — the user answers, then walks away. Present both follow-ups in a **single multi-select prompt**; both checkable, neither pre-selected:

| Action          | Runs (in step 4)                 | Purpose                                                               |
| --------------- | -------------------------------- | --------------------------------------------------------------------- |
| Reset + install | `pnpm reset` then `pnpm install` | Wipes `node_modules` + `pnpm-lock.yaml`, rebuilds from `package.json` |
| Validate        | `pnpm lint` then `pnpm test`     | Lint, typecheck, and unit tests — confirms nothing's broken           |

Remember the selection; it runs in step 4 after the update, not now. Neither checked -> nothing runs after the update.

Headless (CI) or briefed by a caller not to prompt -> skip this step; treat it as neither checked.

## 2. List what's outdated

```
pnpm list-outdated-deps
```

Report the outdated packages and any peer-version mismatches before changing anything. `eslint`, `@eslint/js`, and `typescript` are excluded by the scripts on purpose — never bump them by hand.

## 3. Update the dependencies

```
pnpm update-outdated-deps
```

## 4. Run the selected follow-ups

Run only what the user checked in step 1, and only if the update actually changed something:

- **Nothing was outdated, or `update-outdated-deps` failed** -> skip the follow-ups; say so.
- **Neither checked** -> done.
- **Both checked** -> reset + install first, then validate (validation runs against the fresh install).
- **One checked** -> run just that one.

## Report

Summarize: packages bumped (old -> new), peer fixes applied, and which final actions ran (reset + install, validate, or none) with their result. Flag any major-version jumps — those are the likely breakage points; recommend `pnpm lint` + `pnpm test` before committing if validation didn't run.
