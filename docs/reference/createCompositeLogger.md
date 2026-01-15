---
order: 60
label: createCompositeLogger
meta:
    title: createCompositeLogger
toc:
    depth: 2-3
---

# createCompositeLogger

A factory function to create a `CompositeLogger` instance from Workleap libraries standard logging API.

## Reference

```ts
const logger = createCompositeLogger(verbose, loggers)
```

### Parameters

- `verbose`: Indicates whether or not debug information should be logged. If no loggers are provided, the `CompositeLogger` instance will be created with a `ConsoleLogger` instance by default.
- `loggers`: Loggers to create the `CompositeLogger` with.

### Returns

A `CompositeLogger` instance.

## Usage

```ts !#4
import { ConsoleLogger } from "@workleap/logging";
import { LogRocketLogger } from "@workleap/telemetry"; // or from "@workleap/logrocket";

const logger = createCompositeLogger(false, [new ConsoleLogger(), new LogRocketLogger()]);
```
