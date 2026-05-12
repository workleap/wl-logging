# LoggerScope

Defines the interface for logger scope implementations.

> A scope is a temporary, named logging context that groups related log entries together. A scope is typically created to trace the execution of a specific operation, request, or correlating events. All logs outputted through the scope are grouped under its label, making it easier to visually group messages. Scopes can include multiple log levels and chained segments.

## Reference

### Methods

- `withText(text, options?)`: Adds a text segment to the log entry.
- `withError(error)`: Adds an `Error` object to the log entry.
- `withObject(obj)`: Adds an arbitrary object to the log entry.
- `debug(log?, options?)`: Output a log entry at the debug level. Typically used for low-level diagnostic information.
- `information(log?, options?)`: Output a log entry at the information level. Typically used for general information.
- `warning(log?, options?)`: Output a log entry at the warning level. Typically indicates a potential problem or unexpected state.
- `error(log?, options?)`: Output a log entry at the error level. Typically used for failures and issues.
- `critical(log?, options?)`: Output a log entry at the critical level. Typically indicates severe errors or conditions requiring immediate attention.
- `end(options?)`: Ends the scope, outputting the log entries if the scope is not dismissed.

## Usage

```ts
import { LoggerScope } from "@workleap/logging";

class DummyLoggerScope implements LoggerScope {
    withText() {
        return this;
    }
    withError() {
        return this;
    }
    withObject() {
        return this;
    }
    debug() {}
    information() {}
    warning() {}
    error() {}
    critical() {}
    end() {}
}
```
