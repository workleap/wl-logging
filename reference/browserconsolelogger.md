# BrowserConsoleLogger

A logger outputting messages to a browser console.

## Reference

```ts
const logger = new BrowserConsoleLogger(options?: { logLevel? })
```

### Parameters

- `options`: An optional object literal of options:
    - `logLevel`: Sets the minimum severity of entries the logger will process. Possible values are `debug`, `information`, `warning`, `error`, `critical`.

### Methods

Refer to the [RootLogger](./RootLogger.md) and [LoggerScope](./LoggerScope.md) documentation.

!!!tip
When styling is applied to any text segment, all error or object segments are appended at the end of the log entry. If no styling is applied, the original sequencing is preserved.
!!!

## Usage

### Log a debug entry

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
logger.debug("Hello world!");
```

### Log an information entry

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
logger.information("Hello world!");
```

### Log a warning entry

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
logger.warning("Hello world!");
```

### Log an error entry

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
logger.error("Hello world!");
```

### Log a critical entry

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
logger.critical("Hello world!");
```

### Filter log entries

A minimum severity of entries to process can be configured as an option. Messages with a lower severity than the configured level will then be ignored.

```ts !#4
import { BrowserConsoleLogger, LogLevel } from "@workleap/logging";

const logger = new BrowserConsoleLogger({
    logLevel: LogLevel.error
});

// Will be ignored because "debug" is lower than the "error" severity.
logger.debug("Hello world!");
```

### Build complex log entry

Multiple segments can be chained to create a log entry that combines styled text, errors, and objects. To process all segments and output the log to the console, complete the chain by calling any log method.

```ts !#5-10
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

logger
    .withText("Processing segment")
    .withObject({ id: 1 })
    .withText("failed with error")
    .withError(new Error("The error"))
    .debug();
```

### Style a log entry

```ts !#7-10,13-16
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

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

```ts !#4
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
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
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
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

```ts !#6-9
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();

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

```ts !#9-12
import { BrowserConsoleLogger } from "@workleap/logging";

const logger = new BrowserConsoleLogger();
const scope = logger.startScope("A scope");

scope.information("Hello world!");

scope.end({
    labelStyle: {
        backgroundColor: "purple",
        color: "white"
    }
});
```
