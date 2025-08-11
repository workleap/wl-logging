import { type Logger, LoggerOptions, type LoggerScope, type LoggerScopeEndOptions, LogItem, LogLevel, type LogOptions } from "@workleap/logging";
import LogRocket from "logrocket";

type LogFunction = (...rest: unknown[]) => void;
type PendingLog = () => void;

export class LogRocketLoggerScope implements LoggerScope {
    readonly #logLevel: LogLevel
    readonly #label: string;

    #logItems: LogItem[] = [];
    #pendingLogs: PendingLog[] = [];
    #hasEnded: boolean = false;

    constructor(label: string, logLevel: LogLevel) {
        this.#logLevel = logLevel;
        this.#label = label;
    }

    #resetLogItems() {
        this.#logItems = [];
    }

    #appendText(currentText: string, newText: string) {
        if (currentText.length > 0) {
            return `${currentText} ${newText}`;
        }

        return newText;
    }

    #formatItems(logItems: LogItem[]) {
        let text: string = "";
        const remainingItems: unknown[] = [];

        logItems.forEach(x => {
            if (x.text) {
                text = this.#appendText(text, x.text);
            } else if (x.obj) {
                remainingItems.push(x.obj);
            } else if (x.error) {
                remainingItems.push(x.error);
            }
        });

        if (text.length > 0) {
            return [
                `(${this.#label})`,
                text,
                ...remainingItems
            ];
        }

        return [
            `(${this.#label})`,
            ...remainingItems
        ];
    }

    #log(fct: LogFunction, threshold: LogLevel) {
        if (this.#logItems.length > 0) {
            if (this.#logLevel <= threshold) {
                // Required closure to preserved the current log items for when they will be formatted when the scope is ended.
                const logItems = this.#logItems;

                this.#pendingLogs.push(() => {
                    const formattedItems = this.#formatItems(logItems);

                    fct(...formattedItems);
                });
            }

            this.#resetLogItems();
        }
    }

    withText(text: string, options: LogOptions = {}) {
        this.#logItems.push({
            text,
            options
        });

        return this;
    }

    withError(error: Error) {
        this.#logItems.push({
            error
        });

        return this;
    }

    withObject(obj: object) {
        this.#logItems.push({
            obj
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.log, LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.log, LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.warn, LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.error, LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.error, LogLevel.critical);
    }

    end(options: LoggerScopeEndOptions = {}) {
        const {
            dismiss = false
        } = options;

        if (!this.#hasEnded) {
            this.#hasEnded = true;

            if (!dismiss) {
                if (this.#pendingLogs.length > 0) {
                    this.#pendingLogs.forEach(x => {
                        x();
                    });

                    this.#pendingLogs = [];
                }
            }
        }
    }
}

export class LogRocketLogger implements Logger {
    readonly #logLevel: LogLevel;
    #logItems: LogItem[] = [];

    constructor(options: LoggerOptions = {}) {
        const {
            logLevel = LogLevel.debug,
        } = options

        this.#logLevel = logLevel;
    }

    #resetLogItems() {
        this.#logItems = [];
    }

    #log(fct: LogFunction, threshold: LogLevel) {
        if (this.#logItems.length > 0) {
            if (this.#logLevel <= threshold) {
                const logs = this.#logItems.reduce<unknown[]>((acc, x) => {
                    if (x.text) {
                        acc.push(x.text);
                    } else if (x.obj) {
                        acc.push(x.obj);
                    } else if (x.error) {
                        acc.push(x.error);
                    }

                    return acc;
                }, []);

                fct(...logs);
            }

            this.#resetLogItems();
        }
    }

    getName() {
        return LogRocketLogger.name;
    }

    withText(text: string, options: LogOptions = {}) {
        this.#logItems.push({
            text,
            options
        });

        return this;
    }

    withError(error: Error) {
        this.#logItems.push({
            error
        });

        return this;
    }

    withObject(obj: object) {
        this.#logItems.push({
            obj
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.log, LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.log, LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.warn, LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.error, LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(LogRocket.error, LogLevel.critical);
    }

    startScope(label: string) {
        return new LogRocketLoggerScope(label, this.#logLevel);
    }
}
