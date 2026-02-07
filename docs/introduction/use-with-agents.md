---
order: 90
label: Use with agents
toc:
    depth: 2-3
---

# Use with agents

Information about this logging library can be shared with different agents using the [workleap-logging](https://skills.sh/workleap/wl-logging/workleap-logging) agent skill.

## Install agent skill

Open a terminal and install the `workleap-logging` agent skill by running the following command:

```bash
npx skills add https://github.com/workleap/wl-logging --skill workleap-logging
```

!!!tip
The `skills.sh` CLI will prompt you to choose whether to install the skill globally or within a project. We recommend installing it **locally** so it is available for code review tools such as [Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review) or [Claude Code](https://github.com/anthropics/claude-code-action).
!!!

## Try it :rocket:

Once the skill is installed, start an agent and ask it to setup a project:

```
I'm setting up logging in a new React + TypeScript application. Setup the project to use Workleap logging using the documented APIs and patterns, and write a simple log to the console with a logger.
```
