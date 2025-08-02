import type { Logger, LoggerScope } from "./Logger.ts";

export class NoopLoggerScope implements LoggerScope {
    debug() {}
    information() {}
    warning() {}
    error() {}
    critical() {}
    end() {}
}

export class NoopLogger implements Logger {
    getName() {
        return NoopLogger.name;
    }
    debug() {}
    information() {}
    warning() {}
    error() {}
    critical() {}
    startScope() {
        return new NoopLoggerScope();
    }
}
