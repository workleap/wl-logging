# CLAUDE.md

`@workleap/logging` — logging utilities for Workleap web applications. See [CONTRIBUTING.md](./CONTRIBUTING.md) for commands and workflows.

## Agent skills

- `agent-skills/workleap-logging/` is the only source of the published skill. Consumers install it from GitHub with `skills.sh`, and `@workleap/logging` ships it for pnpm: the package's `prepack` script copies it to `packages/logging/skills/`, which is gitignored and removed by `postpack`. Never commit a copy, since `skills.sh` could then discover two `workleap-logging` skills.
- Every change to the skill needs a `patch` changeset for `@workleap/logging`, otherwise pnpm users never receive it.
- Every local skill in `.claude/skills/` (such as the `_update-*` skills) must have `metadata.internal: true` in its frontmatter. Otherwise `skills.sh` lists it as a public skill of this repository and stops finding `workleap-logging`. The [skill-discovery](./.github/workflows/skill-discovery.yml) workflow fails if `skills.sh` discovers anything other than `workleap-logging`.
- `.claude-plugin/marketplace.json` exists so `skills.sh` finds the skill from the repository root. Keep its path in sync if the skill moves.
