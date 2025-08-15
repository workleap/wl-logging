import type { LoggerScope, RootLogger } from "./Logger.ts";

export class NoopLoggerScope implements LoggerScope {
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

export class NoopLogger implements RootLogger {
    getName() {
        return NoopLogger.name;
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
        return new NoopLoggerScope();
    }
}
