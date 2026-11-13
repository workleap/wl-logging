---
name: update-skills
description: Refresh installed agent skills, but only when the matching monorepo package is on the latest minor (patch ignored). Skills with no package gate are always eligible.
model: sonnet
effort: medium
metadata:
  internal: true
---

# Update Skills

Re-pull each `skills add` installed skill in this repo whose upstream moved, but only when the matching package in `package.json` is on the latest `major.minor`, and only past the cooldown. Print the eligibility table before running anything; on lag, skip + warn (never auto-bump deps).

## Cooldown

Nothing is installed until it has sat unchanged upstream for 7 days: a skill's folder, the `skills` CLI release that installs it, and every package that release pulls in. Step 2's listing applies the first two and offers what cleared them as `cli` and, per skill, `latest` — the only version and the only commit a command takes. `--config.minimumReleaseAge=10080` (minutes) on each command applies the third: never drop it. [DESIGN.md](DESIGN.md) tells what the cooldown covers and what it doesn't.

## Skills

Installed skills live in `.claude/skills/` only and are tracked in `skills-lock.json`. Never omit `-a claude-code` or `--copy`: without them the CLI writes a canonical copy to `.agents/skills/` and symlinks it into `.claude/skills/`.

Skills that a dependency ships for pnpm (approved under `permissions` in `pnpm-workspace.yaml`, such as `agent-browser` and the `workleap-*-config(s)` skills) are linked into `.claude/skills/` by `pnpm install` and listed in the `# pnpm` block of `.claude/skills/.gitignore`. They are out of scope: never install them with the skills CLI.

`agent-skills/workleap-logging` is this repo's own published skill, not an install — it's out of scope.

Only `workleap-*` skills use `--full-depth`. `<cli>` and `<latest>` are the listing's. A command names the skill's own folder at `<latest>`: the folder is what cooled, and `--skill` alone installs the first skill of that name anywhere in the repo.

| Skill | Package gate (grep all `package.json`) | Update command |
|---|---|---|
| `git-commit` | — | `pnpm --config.minimumReleaseAge=10080 dlx skills@<cli> add https://github.com/github/awesome-copilot/tree/<latest>/skills/git-commit --skill git-commit -a claude-code --copy -y` |
| `pnpm` | root `packageManager` field (`pnpm@<version>`) — `update-outdated-deps` never bumps it, so this skips until pnpm is upgraded by hand | `pnpm --config.minimumReleaseAge=10080 dlx skills@<cli> add https://github.com/antfu/skills/tree/<latest>/skills/pnpm --skill pnpm -a claude-code --copy -y` |
| `turborepo` | `turbo` | `pnpm --config.minimumReleaseAge=10080 dlx skills@<cli> add https://github.com/vercel/turborepo/tree/<latest>/skills/turborepo --skill turborepo -a claude-code --copy -y` |
| `vitest` | `vitest` | `pnpm --config.minimumReleaseAge=10080 dlx skills@<cli> add https://github.com/antfu/skills/tree/<latest>/skills/vitest --skill vitest -a claude-code --copy -y` |
| `workleap-react-best-practices` | — | `pnpm --config.minimumReleaseAge=10080 dlx skills@<cli> add https://github.com/workleap/wl-web-configs/tree/<latest>/agent-skills/workleap-react-best-practices --skill workleap-react-best-practices -a claude-code --full-depth --copy -y` |

## Process

### 0. Audit drift

Collect three sets and compare them to the table:

- `skills-lock.json` keys -> must equal the `Skill` column.
- `.claude/skills/` folders, minus `_`-prefixed ones (project-local skills, not installs) and the ones listed in the `# pnpm` block of `.claude/skills/.gitignore` (package skills) -> must equal the `Skill` column.
- `.agents/skills/` -> must not exist.

On any mismatch -> **stop**. Print each offender:

- `unknown skill "<name>" at <path> — add a row to SKILL.md and re-run.`
- `stale row "<name>" — missing from <path>. Remove the row or reinstall the skill, then re-run.`

Only proceed once every set matches exactly.

### 1. Read installed versions

For each gated skill, grep every `package.json` under the repo (root, `packages/*`, `samples/*`; never `node_modules`) for the listed package name(s) and collect every pinned version. For the dynamic `@workleap/*-config(s)` gate, grep the pattern — the set changes as packages are added. Skip `workspace:*` versions. For `pnpm`, read the root `packageManager` field.

### 2. Fetch latest versions

For each unique package: `pnpm view <package> version`. Parallelize.

List `cli` and each skill's `pinned`, `latest`, `settled` and `problem`. It takes about a minute, longer when GitHub is slow — run it with a 10-minute timeout:

```
node .claude/skills/_update-skills/scripts/listSkillPins.ts
```

A non-zero exit → **stop**. Print `listing stop:` followed by its message, word for word.

### 3. Compute eligibility

For each gated package: extract `major.minor` from installed vs latest (ignore patch and prereleases) → `current` or `lagging`. A skill is eligible only if every mapped package is `current` **and** every pinned occurrence across the repo matches. Untied skills (`—` gate) are always eligible.

A skill the listing gives a `problem` is `BLOCKED`, whatever its gate says: the listing couldn't vouch for it, because its source or its folder is no longer what `skills-lock.json` and the listing's script record, or because GitHub couldn't be read. Never pull it, and never edit the lock, the table or the script to clear it — a human finds out why first.

Any other eligible skill takes the listing's verdict:

- `settled: false` → `WAIT`: still in cooldown, no `latest` yet.
- `latest` equals `pinned` → `UNCHANGED`: no pull.
- otherwise → `UPDATE`.

### 4. Print eligibility table

Print before running anything. Use `UPDATE`, `UNCHANGED`, `WAIT`, `BLOCKED` (details: the listing's `problem`) or `SKIP` (gated package lagging).

```
skill                          | status     | details
turborepo                      | UPDATE     | turbo 2.11.9 vs latest 2.11.12 (minor matches); b19f6a5 -> 4c1d2e9
workleap-react-best-practices  | UNCHANGED  | no gate; pinned c3c3a6a is latest
git-commit                     | WAIT       | no gate; in cooldown
vitest                         | SKIP       | vitest lagging: 5.0.5 vs latest 5.1.0
...
```

### 5. Run updates

Run the matching command from the table for each `UPDATE` row, `<cli>` and the full 40-character `<latest>` filled in, sequentially — the skill installer mutates a shared store and `skills-lock.json`.

A pull is done when all of these hold; any other outcome is a failed pull:

- The skill's `skills-lock.json` entry carries `latest` as its `ref`, under the `skillPath` it had.
- `node .claude/skills/_update-skills/scripts/listSkillPins.ts --verify <name>` prints `"verified": true`. The lock's `ref` is only what the CLI was asked for; this compares the files it installed with the source at that commit.
- No `.agents/` folder appeared — the CLI release changes from one run to the next, and its `-a` / `--copy` layout may with it.

A pull fails -> restore that skill before the next one, so no half-written files get committed. Before each pull, Read `skills-lock.json` and keep its contents; on failure, Write that copy back — never `git checkout` it, which would also drop the lock entries of skills already updated in this run. Then `git checkout -- <its existing paths>` and `git clean -fd <its paths>`, plus `git clean -fd .agents` when the pull created `.agents/`.

After each pull, grep the skill's new `SKILL.md` frontmatter for `model:`. An upstream-added override switches the conversation model mid-turn for whatever invokes the skill — flag it in the report; never strip it yourself.

### 6. Report

- Skills updated (count + list, each with `<source>` and its pin move `<old commit> -> <new commit>`) — note which ones actually changed files (`git status --short .claude skills-lock.json`)
- Skills unchanged
- Skills in cooldown
- Skills blocked (each with the listing's `problem`, word for word)
- Skills skipped (with the lagging package: installed vs latest)
- Skills whose pulled `SKILL.md` declares `model:` frontmatter
- Any `skills add` failures (full error)
