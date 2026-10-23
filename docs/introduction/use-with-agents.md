---
order: 90
label: Use with agents
toc:
    depth: 2-3
---

# Use with agents

Information about this logging library can be shared with different agents using the [workleap-logging](https://skills.sh/workleap/wl-logging/workleap-logging) agent skill.

The skill can be installed either with [pnpm](#install-with-pnpm) or with [skills.sh](#install-with-skillssh). Choose **only one** of these options, otherwise the skill will be installed twice.

## Install with pnpm

Starting with `pnpm@12.11`, the `@workleap/logging` package ships the `workleap-logging` agent skill, and `pnpm install` links it into your project's agent skill directories. Since the skill is shipped with the package, its content always matches the installed version of `@workleap/logging`. This is the recommended option.

To install the skill, first make sure `@workleap/logging` is a **direct** dependency of a project in your workspace and that an agent skill directory, such as `.claude/skills` or `.cursor/skills`, exists at the root of the workspace.

Then, open a terminal at the root of the workspace and approve the package's skills by running the following command and selecting `@workleap/logging`:

```bash
pnpm approve
```

The decision is saved in the `pnpm-workspace.yaml` file and covers all later versions of the package. The skill is linked as `pnpm-@workleap+logging-workleap-logging`, and pnpm adds a `.gitignore` file to the skill directory so the link is not committed.

For more information, refer to pnpm [agent skills](https://pnpm.io/agent-skills) documentation.

!!!tip
If the skill was previously installed with `skills.sh`, remove it to avoid having it installed twice:

```bash
pnpx skills remove workleap-logging
```
!!!

## Install with skills.sh

If your project doesn't use pnpm, or uses a version older than `pnpm@12.11`, open a terminal and install the `workleap-logging` agent skill by running the following command:

```bash
pnpx skills add https://github.com/workleap/wl-logging --skill workleap-logging
```

If the CLI doesn't find the skill, add the `--full-depth` option:

```bash
pnpx skills add https://github.com/workleap/wl-logging --skill workleap-logging --full-depth
```

!!!tip
The `skills.sh` CLI will prompt you to choose whether to install the skill globally or within a project. We recommend installing it **locally** so it is available for code review tools such as [Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review) or [Claude Code](https://github.com/anthropics/claude-code-action).
!!!

## Try it :rocket:

Once the skill is installed, start an agent and ask it to setup a project:

```
I'm setting up logging in a new React + TypeScript application. Setup the project to use Workleap logging using the documented APIs and patterns, and write a simple log to the console with a logger.
```
