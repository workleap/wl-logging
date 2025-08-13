---
order: 100
label: ConsoleLogger
meta:
    title: ConsoleLogger
toc:
    depth: 2-3
---

# ConsoleLogger

A logger outputting messages to the console.

## Reference

```ts
const logger = new ConsoleLogger(options?: { logLevel? })
```

### Parameters

- `options`: An optional object literal of options:
    - `logLevel`: Sets the minimum severity of entries the logger will process. Possible values are `debug`, `information`, `warning`, `error`, `critical`.

### Methods

- `withText(text, options?)`: Adds a text segment to the log entry.
- `withError(error)`: Adds an `Error` object to the log entry.
- `withObject(obj)`: Adds an arbitrary object to the log entry.
- `debug(log?, options?)`: Output a log entry to the console at the debug level. Typically used for low-level diagnostic information.
- `information(log?, options?)`: Output a log entry to the console at the information level. Typically used for general information.
- `warning(log?, options?)`: Output a log entry to the console at the warning level. Typically indicates a potential problem or unexpected state.
- `error(log?, options?)`: Output a log entry to the console at the error level. Typically used for failures and issues.
- `critical(log?, options?)`: Output a log entry to the console at the critical level. Typically indicates severe errors or conditions requiring immediate attention.
- `startScope(label, options?)`: Begins a logical logging scope with a label to group related log entries.

!!!info
When styling is applied to any text segment, all error or object segments are appended at the end of the log entry. If no styling is applied, the original sequencing is preserved.
!!!

## Scope definition

A scope is a temporary, named logging context that groups related log entries together. A scope is typically created to trace the execution of a specific operation, request, or lifecycle event. All logs outputted through the scope are grouped under its label, making it easier to visually group messages in the console. Scopes can include multiple log levels and chained segments.

### Methods

- `withText(text, options?)`: Adds a text segment to the log entry.
- `withError(error)`: Adds an `Error` object to the log entry.
- `withObject(obj)`: Adds an arbitrary object to the log entry.
- `debug(log?, options?)`: Output a log entry to the console at the debug level. Typically used for low-level diagnostic information.
- `information(log?, options?)`: Output a log entry to the console at the information level. Typically used for general information.
- `warning(log?, options?)`: Output a log entry to the console at the warning level. Typically indicates a potential problem or unexpected state.
- `error(log?, options?)`: Output a log entry to the console at the error level. Typically used for failures and issues.
- `critical(log?, options?)`: Output a log entry to the console at the critical level. Typically indicates severe errors or conditions requiring immediate attention.
- `end(options?)`: Ends the logical scope, outputting the log entries to the console if the scope is not dismissed.

## Usage

### Log a debug entry

```ts !#4
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
logger.debug("Hello world!");
```

### Log an information entry

```ts !#4
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
logger.information("Hello world!");
```

### Log a warning entry

```ts !#4
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
logger.warning("Hello world!");
```

### Log an error entry

```ts !#4
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
logger.error("Hello world!");
```

### Log a critical entry

```ts !#4
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
logger.critical("Hello world!");
```

### Filter log entries

A minimum severity of entries to process can be configured as an option. Messages with a lower severity than the configured level will then be ignored.

```ts !#4
import { ConsoleLogger, LogLevel } from "@workleap/logging";

const logger = new ConsoleLogger({
    logLevel: LogLevel.error
});

// Will be ignored because "debug" is lower than the "error" severity.
logger.debug("Hello world!");
```

### Build complex log entry

Multiple segments can be chained to create a log entry that combines styled text, errors, and objects. To process all segments and output the log to the console, complete the chain by calling any log method.

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

logger
    .withText("Processing segment")
    .withObject({ id: 1 })
    .withText("failed with error")
    .withError(new Error("The error"))
    .debug();
```

### Style a log entry

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

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

```ts
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
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

```ts !#18-19
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
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
scope.end({  dismiss: true });
```

### Style the scope label at creation

A scope label can be styled when the scope is created.

```ts !#5-10
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();

const scope = logger.startScope("Module 1 registration", {
    labelStyle: {
        backgroundColor: "purple",
        color: "white"
    }
});

scope.information("Hello world!);
scope.end();
```

### Style the scope label at end

```ts !#8-13
import { ConsoleLogger } from "@workleap/logging";

const logger = new ConsoleLogger();
const scope = logger.startScope("Module 1 registration");

scope.information("Hello world!);

scope.end({
    labelStyle: {
        backgroundColor: "purple",
        color: "white"
    }
});
```
