Using the **“skill-creator”** skill, create an agent skill for the **Workleap Logging** library (`wl-logging`), based on the official documentation.

The purpose of this skill is to help developers correctly understand, configure, and use Workleap’s logging APIs in frontend and shared TypeScript codebases, following documented patterns and conventions.

The skill should enable an agent to:

* Explain the purpose of `wl-logging` and the problems it solves in Workleap applications.
* Describe the main concepts of the library, including loggers, log levels, handlers, and contextual data.
* Explain how to create and configure loggers using the documented APIs.
* Show how to enrich logs with contextual information (such as application or request context).
* Describe how logging integrates with other Workleap tooling (for example, telemetry or observability platforms) when explicitly documented.
* Provide examples of common logging patterns, such as application-level logging, feature-level logging, and error logging.
* Answer developer questions using only documented `wl-logging` APIs and recommended usage patterns.

The skill must:

* Not invent APIs, configuration options, or behaviors that are not documented.
* Not suggest undocumented, deprecated, or discouraged usage patterns.
* Avoid generic logging advice unless it directly maps to `wl-logging` concepts.
* Treat the official `wl-logging` documentation as the single source of truth.

The agent should assume:

* A modern TypeScript codebase (often React-based on the frontend).
* Logging is used for diagnostics, troubleshooting, and observability rather than user-facing behavior.
* Applications want consistent and structured logs that can be reviewed in pull requests and production tooling.

The generated skill should:

* Provide clear, concise explanations and examples.
* Be reliable for pull request reviews, developer support, and onboarding.
* Minimize token usage by focusing only on relevant `wl-logging` concepts and APIs.

Relevant questions the skill should be able to answer:

* What is `wl-logging` and what problems does it solve in Workleap applications?
* What are the core concepts of `wl-logging` (loggers, handlers, log levels)?
* How do you create a logger using the `wl-logging` API?
* How do you configure log levels and control log verbosity?
* How do you attach contextual information to logs?
* What is the recommended way to log errors and exceptions?
* How should application-level and feature-level loggers be structured?
* How does `wl-logging` integrate with observability or telemetry tooling when documented?
* What are common mistakes when using `wl-logging` in an application?
* How should logging usage be reviewed and validated in pull requests?

The documentation is located in the official `wl-logging` documentation site.
Only use the documented public APIs and guides provided there. Ignore any inferred, internal, or undocumented behavior.

The documentation is located in the "docs" folder. Only use the documented public APIs and guides provided there. Ignore any inferred, internal, or undocumented behavior:

* ./docs/introduction
* ./docs/reference

The skill should at least trigger when the agent encounters questions about:

* Setting up or configuring logging in a Workleap application
* Creating or modifying loggers
* Logging errors or important application events
* Adding contextual information to logs
* Reviewing logging-related changes in pull requests
* Questions about logging best practices specific to `wl-logging`
