---
order: 100
label: Getting started
meta:
    title: Getting started
---

# Getting started

## Install the package

First, open a terminal at the root of the application and install the following package:

```bash
pnpm add @workleap/logging
```

## Write console logs

A logger can output log entries with different levels: `debug`, `information`, `warning`, `error`, `critical`. This allows to [filter log entries](#filter-log-entries) according to a minimum severity:

```ts !#5-9
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger.debug("Application started!");
logger.information("Application started!");
logger.warn("Application is slow to start.");
logger.error("An error occurred while starting the application.");
logger.critical("Application failed to start.");
```

### Basic text logs

The simplest form is logging plain text directly at the desired level:

```ts !#5
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger.debug("Application started!");
```

### Complex logs

Segments can be chained to build richer log entries that include text, errors and objects:

```ts !#5-9
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger
    .withText("Failed to process order")
    .withObject({ orderId: 12345 })
    .withError(new Error("Payment declined"))
    .error();
```

### Styled logs

When using a logger that supports styling, individual text segments can be styled:

```ts !#7-10,14-16
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger
    .withText("Build completed", {
        style: {
            color: "green",
            fontWeight: "bold"
        }
    })
    .withText("in")
    .withText("250ms", { 
        style: {
            color: "gray"
        } 
    })
    .information();
```

!!!tip
If styling is not supported by the logger, the text is logged without any styling.
!!!

### Line change

A log entry can span multiple lines by adding line breaks:

```ts !#7
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger
    .withText("First line")
    .withLineChange()
    .withText("Second line")
    .debug();
```

## Create a logging scope

Scopes group related log entries under a shared label or context. This is useful for tracing operations, request or correlating events:

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
const scope = logger.startScope("User signup");

scope.information("Form loaded");
scope.debug("User entered email");

scope.
    .withText("Failed to create account")
    .withError(new Error("Email is already used."))
    .error();

scope.end();
```

## LogRocket session replays

By default, [LogRocket](https://logrocket.com/) session replays exclude console output. To send log entries to LogRocket, use the [LogRocketLogger](https://workleap.github.io/wl-telemetry/honeycomb/reference/logrocketlogger) class from the [@workleap/logrocket](https://www.npmjs.com/package/@workleap/logrocket):

```ts !#3
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new LogRocketLogger();

logger.debug("Application started!");
```

## Compose loggers

You can forward the same log entry to multiple destinations by composing loggers:

```ts !#4-7
import { BrowserConsoleLogger, CompositeLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new BrowserConsoleLogger(),
    new LogRocketLogger()
]);

logger.debug("Application started!");
```

In the previous example, `Application started!` will be processed by both logger instances :point_up:

## Filter log entries

A minimum severity of entries to process can be configured as an option. Messages with a lower severity than the configured level will then be ignored.

```ts !#4
import { BrowserConsoleLogger, LogLevel } from "@workleap/logging";

const logger = new BrowserConsoleLogger({
    logLevel: LogLevel.error
});

// Will be ignored because "debug" is lower than the "error" severity.
logger.debug("Hello world!");
```

<!-- In the previous example, the logger instance would process only `error` and `critical` entries :point_up:. For development environments, we generally recommend setting the minimum severity to `debug`, and for production environments to `information`. `information` provides a good balance, detailed enough for basic troubleshooting, while reducing noise in production. -->

In the previous example, the logger instance would process only `error` and `critical` entries :point_up:.

For development environments, we generally recommend setting the minimum severity to `debug`. For production environments, we recommend setting the minimum severity to `information`. The `information` level provides a good balance as it is detailed enough for basic troubleshooting, while reducing noise in production.

For reference, here's a description of each level:

### Debug

- Very detailed, often verbose, logs used mainly during development.
- _Example: API request/response bodies, lifecycle hooks, variable state._

### Information

- General events that show the normal flow of the application.
- _Example: User login, component mounted, scheduled task started._

### Warning

- Non-critical issues that might need attention but don't break functionality.
- _Example: Deprecated API usage, retries after a failed network call._

### Error

- Failures that prevent part of the system from working as intended.
- _Example: Unhandled exceptions, failed database query, API call failed with 500._

### Critical

- Severe errors that cause the application to stop functioning or risk data integrity.
- _Example: Application crash, loss of critical service connection._






