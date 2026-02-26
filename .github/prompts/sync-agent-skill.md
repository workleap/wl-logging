# Sync Workleap Logging Skill

You are an automated agent responsible for keeping the `workleap-logging` agent skill in sync with the documentation in `./docs`.

## Constraints

When updating the skill:

- Do NOT change the format of existing skill files.
- You MAY create new `references/*.md` files when new content does not fit any existing reference file.
- Do NOT embed metadata in skill files.
- Do NOT add "Sources:" lines to skill files.
- Do NOT create or modify any files outside `agent-skills/workleap-logging/`.
- Do NOT use TodoWrite, TaskCreate, or any task tracking tools.
- Do NOT read `AGENTS.md` or `agent-docs/`.
- Never update a versioned skill. You can identify a versioned skill with its folder name pattern, e.g. `workleap-logging-v*`.
- Never change skill content unless you can point to a specific line in `./docs` that contradicts the current skill text. If you cannot identify the exact discrepancy, do not touch the content.
- The SKILL.md body must stay under ~250 lines. New API content goes in the appropriate `references/` file, not in the body. Only add to the body if the content is a critical pattern that agents need in nearly every conversation.

## Excluded docs

The following docs are **not** part of the skill and must be ignored:

- `docs/_includes/` — Site template includes (HTML layout, not library content)
- `docs/static/` — Static assets (images, favicons)
- `docs/default.md` — Retype site redirect configuration
- `docs/about.md` — Contributing guidelines and license information
- `docs/introduction/index.yml` — Retype navigation ordering metadata
- `docs/introduction/use-with-agents.md` — Skill installation instructions (meta-docs about the skill itself)
- `docs/samples.md` — Link to sample applications on GitHub (no library content)

All other `.md` files under `docs/` are in scope.

## Docs-to-skill file routing

Use this table to route docs content to the correct skill file:

| Skill file | Primary docs sources |
|---|---|
| `SKILL.md` | `docs/introduction/*` |
| `references/api.md` | `docs/reference/*` |
| `references/patterns.md` | `docs/introduction/getting-started.md` |

If a doc does not match any row above, use your best judgment to route it to the most relevant skill file. Always respect the "Excluded docs" section — never sync content from excluded paths.

---

## Step 1: Update skill

Review the existing `workleap-logging` skill in `./agent-skills/workleap-logging/` and make sure that all API definitions and examples match the current documentation available in `./docs`. Use the routing table above to target your comparisons. Ignore any docs listed in the "Excluded docs" section.

## Step 2: Check for changes

After updating the skill, check whether any files were actually modified:

```bash
git diff --name-only HEAD -- agent-skills/workleap-logging/
git ls-files --others --exclude-standard -- agent-skills/workleap-logging/
```

If both commands produce empty output (no changes at all), STOP immediately. Print "No skill changes needed — skill is already in sync." You are done.

## Step 3: Validate

Spawn a subagent with the `Task` tool using the **opus** model to validate the updated skill with a fresh context. The subagent validates from two angles: (1) can the skill answer key questions, and (2) are the API signatures and examples factually correct compared to the actual docs.

Use the following prompt for the subagent:

> You are a validator for the `workleap-logging` agent skill. Your job is to verify both **coverage** and **accuracy**.
>
> ## Part A — Coverage
>
> Read all files in `./agent-skills/workleap-logging/`. Using ONLY those files, determine whether the skill can adequately answer each question below. For each, respond PASS or FAIL with a brief explanation.
>
> 1. What is @workleap/logging and what problems does it solve?
> 2. How do you install @workleap/logging?
> 3. What logger types are available and when do you use each?
> 4. How do you create a BrowserConsoleLogger with a minimum log level?
> 5. How do you create a CompositeLogger with multiple underlying loggers?
> 6. What are the five log levels and their intended severity order?
> 7. How do you use chained segments to build complex log entries?
> 8. What happens if you forget to call a log level method at the end of a chain?
> 9. How do you apply styles (color, font weight, background) to log text?
> 10. How do you insert line breaks between segments?
> 11. What are scopes and how do you start and end one?
> 12. How do you dismiss a scope without outputting its entries?
> 13. How do you style scope labels at creation and at end?
> 14. What is the difference between `Logger` and `RootLogger`, and when must you cast?
> 15. How do you integrate @workleap/logging with LogRocket?
> 16. What is `createCompositeLogger` and what are its parameters?
> 17. What are the recommended log levels for development vs production?
> 18. How do you set up environment-based logger configuration?
> 19. How do you properly log errors with context (object data and stack trace)?
> 20. What are common mistakes when using @workleap/logging?
> 21. What should you check when reviewing a PR that changes logging code?
>
> ## Part B — Accuracy
>
> Now read all `.md` files under `./docs/`, excluding the paths listed in the "Excluded docs" section of `.github/prompts/sync-agent-skill.md`. For each code example and API signature in the skill files, verify it matches the docs. Report any discrepancies: wrong parameter names, missing arguments, incorrect types, outdated patterns.
>
> ## Output
>
> End with:
> - `COVERAGE: X/21 PASSED`
> - `ACCURACY: list of discrepancies (or "No discrepancies found")`

If any coverage question is marked FAIL or accuracy discrepancies are found, go back to Step 1 and fix the gaps. Retry at most 3 times. If validation passes, proceed to Step 4. If validation still fails after 3 retries, proceed to Step 4 anyway but include the unresolved issues in the PR (see Step 4c).

## Step 4: Success

### 4a: Increment version

Read the `metadata.version` field in the YAML frontmatter of `agent-skills/workleap-logging/SKILL.md`. Increment the **minor** part of the version (e.g., `1.0` → `1.1`, `5.3` → `5.4`). Update the file with the new version.

### 4b: Create branch and commit

```bash
BRANCH_NAME="agent/skill-sync-$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
git checkout -b "$BRANCH_NAME"
git add agent-skills/workleap-logging/
git commit -m "chore(skill): sync workleap-logging skill with docs [skip ci]"
git push origin "$BRANCH_NAME"
```

### 4c: Create pull request

If validation passed cleanly:

```bash
gh pr create \
  --base main \
  --head "$BRANCH_NAME" \
  --title "chore(skill): sync workleap-logging skill" \
  --body "## Summary

<Write a short summary of what was updated in the skill>"
```

If validation still had failures after 3 retries, create the PR anyway but include a warnings section:

```bash
gh pr create \
  --base main \
  --head "$BRANCH_NAME" \
  --title "chore(skill): sync workleap-logging skill" \
  --body "## Summary

<Write a short summary of what was updated in the skill>

## ⚠️ Validation Warnings

The following issues could not be resolved after 3 retries:

<List the failed coverage questions and/or accuracy discrepancies>"
```

Then STOP. You are done.
