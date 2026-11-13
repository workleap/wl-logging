# CLAUDE.md

`@workleap/logging` — logging utilities for Workleap web applications. See [CONTRIBUTING.md](./CONTRIBUTING.md) for commands and workflows.

## Agent skills

- `agent-skills/workleap-logging/` is the only source of the published skill. Consumers install it from GitHub with `skills.sh`, and `@workleap/logging` ships it for pnpm: the package's `prepack` script copies it to `packages/logging/skills/`, which is gitignored and removed by `postpack`. Never commit a copy, since `skills.sh` could then discover two `workleap-logging` skills.
- Every change to the skill needs a `patch` changeset for `@workleap/logging`, otherwise pnpm users never receive it. The CI fails a pull request that changes the skill without adding one. Never add `[skip ci]` to a commit that changes the skill: it skips that check and the release.
- Every local skill in `.claude/skills/` (such as the `_update-*` skills) must have `metadata.internal: true` in its frontmatter. Otherwise `skills.sh` lists it as a public skill of this repository and stops finding `workleap-logging`. The [skill-discovery](./.github/workflows/skill-discovery.yml) workflow fails if `skills.sh` discovers anything other than `workleap-logging`.
- `.claude-plugin/marketplace.json` exists so `skills.sh` finds the skill from the repository root. Keep its path in sync if the skill moves.

## GitHub Actions

Renovate merges its GitHub Actions updates into `main` without a pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md#github-actions) for the setup and what it depends on.

- Never remove the `renovate/**` push trigger from `ci.yml`: Renovate never merges a branch that has no passing check.
- Pin every `uses:` to a commit hash with its release in a comment (`owner/repo@<sha> # vX.Y.Z`), never to a tag (`@v7`, `@latest`) or a branch. Never drop the version comment: Renovate ignores a hash that has none.
- Never move `anthropics/claude-code-action` back into the shared Renovate group, and never add a `schedule` to throttle it.
- Never replace the `automerge` settings of `renovate.json` with the organization's `all-automerge.json` preset, which leaves major updates out, and never add a branch protection on `main` that requires a pull request or an approval, which stops the auto-merge.
