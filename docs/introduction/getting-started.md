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

A logger can output log entries with different levels (`debug`, `information`, `warning`, `error`, `critical`). This allows to filter logs according to a minimum severity:

```ts !#4
import { ConsoleLogger, LogLevel } from "@workleap/logging";

const logger = new ConsoleLogger({
    logLevel: LogLevel.error
});
```

In the previous example, the logger instance would process only `error` and `critical` entries :point_up:

### Basic text logs

The simplest form is logging plain text directly at the desired level:

```ts !#5
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

logger.debug("Application started!");
```

### Complex logs

Segments can be chained to build richer log entries that include text, errors and objects:

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

logger
    .withText("Failed to process order")
    .withObject({ orderId: 12345 })
    .withError(new Error("Payment declined"))
    .error();
```

### Styled logs

When using a logger that supports styling, individual text segments can be styled:

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

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

!!!tip
When styling is applied to any text segment, all error or object segments are appended at the end of the log entry.
!!!

## Create a logging scope

Scopes group related log entries under a shared label or context. This is useful for tracing operations, request or correlating events:

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
const scope = logger.startScope("User signup");

scope.information("Form loaded");
scope.debug("User entered email");

scope.
    .withText("Failed to create account")
    .withError(new Error("Email is already used."))
    .error();

scope.end();
```

## Compose loggers

You can forward the same log entry to multiple destinations by composing loggers:

```ts
import { ConsoleLogger, CompositeLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.debug("Application started!");
```

In the previous example, `Application started!` will be processed by both logger instances :point_up:







