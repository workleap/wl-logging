# `update-third-parties` — design notes

> **Maintainers only.** This file is **not** loaded by the Claude Code skill loader — only `SKILL.md` is ingested when the skill is invoked. Keep operational instructions in `SKILL.md`; keep rationale here.

Adapted from [`workleap/wl-app`](https://github.com/workleap/wl-app/tree/main/.claude/skills/_update-third-parties). This repo has no vendored Intent UI and no e2e suite, so the Intent UI target is dropped and the e2e follow-up becomes `pnpm lint` + `pnpm test`.

| Decision | Choice | Why |
|---|---|---|
| Orchestrator model | `model: sonnet` | The orchestration is mechanical — prompt, dispatch, aggregate — so opus is wasted, but it must compose leaf briefs and merge reports; haiku under-serves that. Right-first-time tiering: a botched brief or dropped report line is a silent miss. |
| Leaf model and effort in the table, mirrored in the delegates' frontmatter | Each `Agent` leaf is dispatched at the table's model and effort; the `_update-*` delegates carry the same values in their frontmatter | A skill's `model:` applies for the rest of the turn that invokes it, so inside a leaf it's confined to that leaf; keep the two copies identical so the leaf runs at the same tiering either way. Inline `Skill` invocation would switch the *conversation* model per delegate and leave it on the last one; delegation confines each skill to its leaf. |
| Decisions hoisted to one up-front prompt | The orchestrator asks targets + follow-ups once; leaves are briefed to never prompt (deps: "neither") | Leaves can't reach the user mid-run. The user walks away after one prompt. |
| Follow-ups run last, by a haiku runner leaf | reset + install, then validate, after the final target; skipped when deps changed nothing or failed | Validating after everything checks the combined result, not just the deps bump. A runner leaf quarantines the log bulk; haiku because it's a verbatim relay. |
| Sequential targets | deps -> skills, never parallel | `_update-skills` gates on installed `major.minor` — it must read the bumped `package.json` files — and both contend on the pnpm store. |
| CI doesn't use the orchestrator | `.github/prompts/update-dependencies.md` runs `pnpm update-outdated-deps` inline and `_update-skills` in a subagent, after validation | The orchestrator exists for its up-front prompt; CI has no one to answer it, and the workflow owns its own validation loop (lint, test, browser check of the web sample). Headless, `_update-dependencies` reduces to two pnpm commands, so a subagent buys nothing. `_update-skills` runs in a subagent so its `model:` doesn't drop the whole fix loop to sonnet, and after validation so a package reverted mid-loop doesn't leave a newer skill behind. |
