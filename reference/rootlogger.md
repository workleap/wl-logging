# RootLogger

Defines the interface for logger implementations.

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
- `startScope(label, options?)`: Begins a logging scope with a label to group related log entries. For additional information refer to the [LoggerScope](./LoggerScope.md) documentation.

## Usage

```ts
import { RootLogger } from "@workleap/logging";

class DummyLogger implements RootLogger {
    getName() {
        return DummyLogger.name;
    }
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
    startScope() {
        return new DummyLoggerScope();
    }
}
```
