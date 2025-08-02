import type { EndLoggerScopeOptions, Logger, LoggerScope } from "./Logger.ts";

export class CompositeLoggerScope implements LoggerScope {
    readonly #scopes;

    constructor(scopes: LoggerScope[] = []) {
        this.#scopes = scopes;
    }

    debug(log: string, ...rest: unknown[]) {
        this.#scopes.forEach(x => {
            try {
                x.debug(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    information(log: string, ...rest: unknown[]) {
        this.#scopes.forEach(x => {
            try {
                x.information(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    warning(log: string, ...rest: unknown[]) {
        this.#scopes.forEach(x => {
            try {
                x.warning(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    error(log: string, ...rest: unknown[]) {
        this.#scopes.forEach(x => {
            try {
                x.error(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    critical(log: string, ...rest: unknown[]) {
        this.#scopes.forEach(x => {
            try {
                x.critical(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    end(options?: EndLoggerScopeOptions) {
        this.#scopes.forEach(x => {
            try {
                x.end(options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }
}

export class CompositeLogger implements Logger {
    readonly #loggers;

    constructor(loggers: Logger[] = []) {
        this.#loggers = loggers;
    }

    getName() {
        return CompositeLogger.name;
    }

    debug(log: string, ...rest: unknown[]) {
        this.#loggers.forEach(x => {
            try {
                x.debug(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    information(log: string, ...rest: unknown[]) {
        this.#loggers.forEach(x => {
            try {
                x.information(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    warning(log: string, ...rest: unknown[]) {
        this.#loggers.forEach(x => {
            try {
                x.warning(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    error(log: string, ...rest: unknown[]) {
        this.#loggers.forEach(x => {
            try {
                x.error(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    critical(log: string, ...rest: unknown[]) {
        this.#loggers.forEach(x => {
            try {
                x.critical(log, ...rest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    startScope(label: string) {
        const scopes = this.#loggers.map(x => x.startScope(label));

        return new CompositeLoggerScope(scopes);
    }
}
