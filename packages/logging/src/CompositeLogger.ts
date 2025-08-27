import type { LoggerScope, LoggerScopeEndOptions, LoggerScopeOptions, LogOptions, RootLogger } from "./Logger.ts";

/**
 * A scope implementation for a logger that delegates log entries to multiple underlying loggers.
 * @see {@link https://workleap.github.io/wl-logging}
 */
export class CompositeLoggerScope implements LoggerScope {
    readonly #scopes: LoggerScope[];

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    constructor(scopes: LoggerScope[] = []) {
        this.#scopes = scopes;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withText(text?: string, options?: LogOptions) {
        if (text) {
            this.#scopes.forEach(x => {
                try {
                    x.withText(text, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withError(error?: Error, options?: Omit<LogOptions, "leadingSpace">) {
        if (error) {
            this.#scopes.forEach(x => {
                try {
                    x.withError(error, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withObject(obj?: unknown, options?: Omit<LogOptions, "leadingSpace">) {
        if (obj) {
            this.#scopes.forEach(x => {
                try {
                    x.withObject(obj, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    withLineChange() {
        this.#scopes.forEach(x => {
            try {
                x.withLineChange();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    debug(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#scopes.forEach(x => {
            try {
                x.debug(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    information(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#scopes.forEach(x => {
            try {
                x.information(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    warning(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#scopes.forEach(x => {
            try {
                x.warning(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    error(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#scopes.forEach(x => {
            try {
                x.error(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    critical(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#scopes.forEach(x => {
            try {
                x.critical(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
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

/**
 * A logger implementation that delegates log entries to multiple underlying loggers.
 * @see {@link https://workleap.github.io/wl-logging}
 */
export class CompositeLogger implements RootLogger {
    readonly #loggers: RootLogger[];

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    constructor(loggers: RootLogger[] = []) {
        this.#loggers = loggers;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    getName() {
        return CompositeLogger.name;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withText(text?: string, options?: LogOptions) {
        if (text) {
            this.#loggers.forEach(x => {
                try {
                    x.withText(text, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withError(error?: Error, options?: Omit<LogOptions, "leadingSpace">) {
        if (error) {
            this.#loggers.forEach(x => {
                try {
                    x.withError(error, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withObject(obj?: unknown, options?: Omit<LogOptions, "leadingSpace">) {
        if (obj) {
            this.#loggers.forEach(x => {
                try {
                    x.withObject(obj, options);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error: unknown) {
                // Do nothing...
                }
            });
        }

        return this;
    }

    withLineChange() {
        this.#loggers.forEach(x => {
            try {
                x.withLineChange();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });

        return this;
    }

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    debug(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#loggers.forEach(x => {
            try {
                x.debug(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    information(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#loggers.forEach(x => {
            try {
                x.information(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    warning(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#loggers.forEach(x => {
            try {
                x.warning(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    error(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#loggers.forEach(x => {
            try {
                x.error(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    critical(log?: string, options?: Omit<LogOptions, "leadingSpace">) {
        this.#loggers.forEach(x => {
            try {
                x.critical(log, options);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
                // Do nothing...
            }
        });
    }

    /**
     * Start a new logging scope. The scope will inherit the LogLevel of the root logger.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    startScope(label: string, options?: LoggerScopeOptions) {
        const scopes = this.#loggers.map(x => x.startScope(label, options));

        return new CompositeLoggerScope(scopes);
    }

    /**
     * Return the logger instances wrapped by this composite logger.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    getLoggers() {
        return [...this.#loggers];
    }
}
