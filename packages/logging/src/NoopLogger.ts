import type { LoggerScope, RootLogger } from "./Logger.ts";

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
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

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
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
