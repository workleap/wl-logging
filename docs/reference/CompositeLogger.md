---
order: 90
label: CompositeLogger
meta:
    title: CompositeLogger
toc:
    depth: 2-3
---

# CompositeLogger

A logger implementation that delegates log entries to multiple underlying loggers. It implements the standard [Logger](./Logger.md) and [LoggerScope](./LoggerScope.md) interfaces so it can be used anywhere a single logger is expected, but internally it forwards each chained segment-building and logging calls to underlying loggers.

## Reference

```ts
const logger = new CompositeLogger(loggers);
```

### Parameters

- `loggers`: An array of `Logger` instances.

### Methods

Refer to the [RootLogger](./RootLogger.md) and [LoggerScope](./LoggerScope.md) documentation.

## Usage

### Log a debug entry

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.debug("Hello world!");
```

### Log an information entry

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.information("Hello world!");
```

### Log a warning entry

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.warning("Hello world!");
```

### Log an error entry

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.error("Hello world!");
```

### Log a critical entry

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger.critical("Hello world!");
```

### Filter log entries

Minimum severity entries to process is configured on an invidual logger basis.

```ts !#6,9
import { CompositeLogger, ConsoleLogger, LogLevel } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger({
        logLevel: LogLevel.error
    }),
    new LogRocketLogger({
        logLevel: LogLevel.debug
    })
]);

// Will be ignored because "debug" is lower than the "error" severity.
logger.debug("Hello world!");
```

### Build complex log entry

Multiple segments can be chained to create a log entry that combines styled text, errors, and objects. To process all segments and output the log to the console, complete the chain by calling any log method.

```ts
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger
    .withText("Processing segment")
    .withObject({ id: 1 })
    .withText("failed with error")
    .withError(new Error("The error"))
    .debug();
```

### Style a log entry

Not all loggers support styled log entries. When the underlying loggers do support styling, those styles will be passed forwared to them.

```ts
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

logger
    .withText("Hello", {
        style: {
            backgroundColor: "green",
            color: "white",
        }
    })
    .withText("World", {
        style: {
            backgroundColor: "blue",
            color: "white"
        }
    })
    .information();
```

### Use a logging scope

```ts !#9
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

const scope = logger.startScope("Module 1 registration");

scope.debug("Registering routes...");

scope
    .withText("Routes registered!")
    .withObject([{
        path: "/foo",
        label: "Foo"
    }])
    .debug();

scope.debug("Fetching data...");

scope
    .withText("Data fetching failed")
    .withError(new Error("The specified API route doesn't exist."))
    .error();

scope.debug("Registration failed!", {
    style: {
        backgroundColor: "red",
        color: "white",
        fontWeight: "bold"
    }
});

// Once the scope is ended, the log entries will be outputted to the console.
scope.end();
```

### Dismiss a logging scope

A scope can be dismissed to prevent it's log entries from being outputted to the console.

```ts !#24
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

const scope = logger.startScope("Module 1 registration");

scope.debug("Registering routes...");

scope
    .withText("Routes registered!")
    .withObject([{
        path: "/foo",
        label: "Foo"
    }])
    .debug();

scope.debug("Fetching data...");

// Will not output any log entries to the console.
scope.end({ dismiss: true });
```

### Style the scope label at creation

A scope label can be styled when the scope is created.

```ts !#9-14
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

const scope = logger.startScope("A scope", {
    labelStyle: {
        backgroundColor: "purple",
        color: "white"
    }
});

scope.information("Hello world!");
scope.end();
```

### Style the scope label at end

A scope label can be styled when the scope it's ended. This is particularly useful to style the label accordingly to the status of an operation or request.

```ts !#13-18
import { CompositeLogger, ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/logrocket";

const logger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger();
]);

const scope = logger.startScope("A scope");

scope.information("Hello world!");

scope.end({
    labelStyle: {
        backgroundColor: "purple",
        color: "white"
    }
});
```
