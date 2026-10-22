---
name: update-skills
description: Refresh installed agent skills, but only when the matching monorepo package is on the latest minor (patch ignored). Skills with no package gate are always updated.
model: sonnet
effort: medium
---

# Update Skills

Re-pull every `pnpx skills add` installed skill in this repo, but only when the matching package in `package.json` is on the latest `major.minor`. Print the eligibility table before running anything; on lag, skip + warn (never auto-bump deps).

## Skills

Installed skills live in `.agents/skills/` and are tracked in `skills-lock.json`; the rows marked `.claude` also have a copy in `.claude/skills/`. The `-a` flags reproduce that layout — `codex` targets `.agents/skills/`, `claude-code` adds the `.claude/skills/` copy. Never omit `-a` or `--copy`: the defaults symlink into `.claude/skills/` and change the layout.

`agent-skills/workleap-logging` is this repo's own published skill, not an install — it's out of scope.

Only `workleap-*` skills use `--full-depth`. The CLI version is pinned because the `-a` / `--copy` layout was verified on it — re-verify before bumping.

| Skill | Copies | Package gate (grep all `package.json`) | Update command |
|---|---|---|---|
| `agent-browser` | `.agents` | `agent-browser` | `pnpx skills@1.7.4 add https://github.com/vercel-labs/agent-browser --skill agent-browser -a codex --copy -y` |
| `git-commit` | `.agents` | — | `pnpx skills@1.7.4 add https://github.com/github/awesome-copilot --skill git-commit -a codex --copy -y` |
| `pnpm` | `.agents` | root `packageManager` field (`pnpm@<version>`) — `update-outdated-deps` never bumps it, so this skips until pnpm is upgraded by hand | `pnpx skills@1.7.4 add https://github.com/antfu/skills --skill pnpm -a codex --copy -y` |
| `turborepo` | `.agents` | `turbo` | `pnpx skills@1.7.4 add https://github.com/vercel/turborepo --skill turborepo -a codex --copy -y` |
| `vitest` | `.agents`, `.claude` | `vitest` | `pnpx skills@1.7.4 add https://github.com/antfu/skills --skill vitest -a codex claude-code --copy -y` |
| `workleap-react-best-practices` | `.agents` | — | `pnpx skills@1.7.4 add https://github.com/workleap/wl-web-configs --skill workleap-react-best-practices -a codex --full-depth --copy -y` |
| `workleap-web-configs` | `.agents`, `.claude` | every `@workleap/*-config` / `@workleap/*-configs` present (discover via grep, don't hard-code) | `pnpx skills@1.7.4 add https://github.com/workleap/wl-web-configs --skill workleap-web-configs -a codex claude-code --full-depth --copy -y` |

## Process

### 0. Audit drift

Collect three sets and compare them to the table:

- `skills-lock.json` keys and `.agents/skills/` folders -> must both equal the `Skill` column.
- `.claude/skills/` folders, minus `_`-prefixed ones (project-local skills, not installs) -> must equal the rows whose `Copies` include `.claude`.

On any mismatch -> **stop**. Print each offender:

- `unknown skill "<name>" at <path> — add a row to SKILL.md and re-run.`
- `stale row "<name>" — missing from <path>. Remove the row or reinstall the skill, then re-run.`

Only proceed once every set matches exactly.

### 1. Read installed versions

For each gated skill, grep every `package.json` under the repo (root, `packages/*`, `samples/*`; never `node_modules`) for the listed package name(s) and collect every pinned version. For the dynamic `@workleap/*-config(s)` gate, grep the pattern — the set changes as packages are added. Skip `workspace:*` versions. For `pnpm`, read the root `packageManager` field.

### 2. Fetch latest versions

For each unique package: `pnpm view <package> version`. Parallelize.

### 3. Compute eligibility

For each gated package: extract `major.minor` from installed vs latest (ignore patch and prereleases) → `current` or `lagging`. A skill is eligible only if every mapped package is `current` **and** every pinned occurrence across the repo matches. Untied skills (`—` gate) are always eligible.

### 4. Print eligibility table

Print before running anything. Use `UPDATE` or `SKIP` (gated package lagging).

```
skill                          | status  | details
turborepo                      | UPDATE  | turbo 2.11.9 vs latest 2.11.12 (minor matches)
workleap-web-configs           | SKIP    | @workleap/rsbuild-configs lagging: 5.0.0 vs latest 5.1.0
git-commit                     | UPDATE  | no gate
...
```

### 5. Run updates

Run the matching command from the table for each `UPDATE` row, sequentially — the skill installer mutates a shared store and `skills-lock.json`.

A pull fails -> restore that skill before the next one, so no half-written files get committed: `git checkout -- <its existing paths> skills-lock.json`, then `git clean -fd <its paths>`.

After each pull, grep the skill's new `SKILL.md` frontmatter for `model:`. An upstream-added override switches the conversation model mid-turn for whatever invokes the skill — flag it in the report; never strip it yourself.

### 6. Report

- Skills updated (count + list) — note which ones actually changed files (`git status --short .agents .claude skills-lock.json`)
- Skills skipped (with the lagging package: installed vs latest)
- Skills whose pulled `SKILL.md` declares `model:` frontmatter
- Any `pnpx skills add` failures (full error)
