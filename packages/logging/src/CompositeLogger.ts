import type { Logger, LoggerScope, LoggerScopeEndOptions, LoggerScopeOptions, LogOptions } from "./Logger.ts";

export class CompositeLoggerScope implements LoggerScope {
    readonly #scopes: LoggerScope[];

    constructor(scopes: LoggerScope[] = []) {
        this.#scopes = scopes;
    }

    withText(text: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.withText(text, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    withError(error: Error, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.withError(error, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    withObject(obj: object, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.withObject(obj, options)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.debug(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    information(log?: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.information(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    warning(log?: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.warning(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    error(log?: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.error(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    critical(log?: string, options?: LogOptions) {
        this.#scopes.forEach(x => {
            try {
                x.critical(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    end(options?: LoggerScopeEndOptions) {
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
    readonly #loggers: Logger[];

    constructor(loggers: Logger[] = []) {
        this.#loggers = loggers;
    }

    getName() {
        return CompositeLogger.name;
    }

    withText(text: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.withText(text, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    withError(error: Error, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.withError(error, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    withObject(obj: object, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.withObject(obj, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.debug(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    information(log?: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.information(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    warning(log?: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.warning(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    error(log?: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.error(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    critical(log?: string, options?: LogOptions) {
        this.#loggers.forEach(x => {
            try {
                x.critical(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    startScope(label: string, options?: LoggerScopeOptions) {
        const scopes = this.#loggers.map(x => x.startScope(label, options));

        return new CompositeLoggerScope(scopes);
    }
}
