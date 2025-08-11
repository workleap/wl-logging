import { LogBuilder, LoggerScopeEndOptions, LogLevel, TextItem, type Logger, type LoggerScope, type LoggerScopeOptions, type LogItem, type LogOptions } from "./Logger.ts";

/*

-> Also provide a LoggerProvider / LoggerContext for React?
    -> Could it though encourage Squide devs to define a new Provider rather than using Squide logger?

-> I think the libraries "verbose" mode should also log to LogRocket by default <----- NO NO NO
    -> Or not? What if the app isn't using LogRocket?
    -> And that would add a dependency on LogRocket for those libraries

-> App could either create their own logger or use squide logger

logger
    .withText("helllo", OPTIONS)
    .withText(" world!")
    .withObject({ name: "John Doe" })
    .withError(new Error("foo"))
    .debug();

logger.debug("hello world!");

logger.debug("hello world!", OPTIONS);

*/

export function convertCssInlineStyleToConsoleStyle(cssProps: Partial<CSSStyleDeclaration>) {
    return Object.entries(cssProps)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)}:${value}`)
        .join(";");
}

function appendText(currentText: string, newText: string) {
    if (currentText.length > 0) {
        return `${currentText} ${newText}`;
    }

    return newText;
}

export function formatItems(logItems: LogItem[]) {
    const textItems: TextItem[] = [];
    const others: unknown[] = [];

    logItems.forEach(x => {
        if (x.text) {
            textItems.push(x as TextItem);
        } else if (x.obj) {
            others.push(x.obj);
        } else if (x.error) {
            others.push(x.error);
        }
    });

    let text = "";

    const styling: string[] = [];

    textItems.forEach(x => {
        if (x.options?.style) {
            text = appendText(text, `%c${x.text}%c`);

            styling.push(convertCssInlineStyleToConsoleStyle(x.options.style));
            styling.push("%s");
        } else {
            text = appendText(text, x.text);
        }
    });

    return [
        text,
        ...styling,
        ...others
    ]
}

type LogFunction = (...rest: unknown[]) => void;

type PendingLog = () => void;

export class ConsoleLoggerScope implements LoggerScope {
    readonly #logLevel: LogLevel;
    readonly #label: string;
    readonly #labelStyle?: Partial<CSSStyleDeclaration>;

    #logItems: LogItem[] = [];
    #pendingLogs: PendingLog[] = [];
    #hasEnded: boolean = false;

    constructor(label: string, logLevel: LogLevel, options: LoggerScopeOptions = {}) {
        this.#logLevel = logLevel;
        this.#label = label;
        this.#labelStyle = options.labelStyle;
    }

    #resetLogItems() {
        this.#logItems = [];
    }

    // Categorized logs (warn, error, etc..) will only show in the console when the console group is open, which is a weird
    // behavior for categorized logs such as error.
    // To alleviate the situation, those categorized logs are logged twice: one time in the group and one time at the root.
    #log(fcts: LogFunction[], threshold: LogLevel) {
        if (this.#logItems.length > 0) {
            if (this.#logLevel <= threshold) {
                // Required closure to preserved the current log items for when they will be formatted when the scope is ended.
                const logItems = this.#logItems;

                this.#pendingLogs.push(() => {
                    const formattedItems = formatItems(logItems);

                    fcts.forEach(x => {
                        x(...formattedItems);
                    })
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

        this.#log([console.log], LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log([console.log], LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log([console.log, console.warn], LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log([console.log, console.error], LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log([console.log, console.error], LogLevel.critical);
    }

    end(options: LoggerScopeEndOptions = {}) {
        const {
            labelStyle,
            dismiss = false
        } = options;

        if (!this.#hasEnded) {
            this.#hasEnded = true;

            if (!dismiss) {
                if (this.#pendingLogs.length > 0) {
                    const style = labelStyle ?? this.#labelStyle;
                    const label = style ? [`%c${this.#label}`, convertCssInlineStyleToConsoleStyle(style)] : [this.#label];

                    console.groupCollapsed(...label);

                    this.#pendingLogs.forEach(x => {
                        x();
                    });

                    this.#pendingLogs = [];

                    console.groupEnd();
                }
            }
        }
    }
}

export class ConsoleLogger implements Logger {
    readonly #logLevel: LogLevel;
    #logItems: LogItem[] = [];

    constructor(logLevel: LogLevel = LogLevel.debug) {
        this.#logLevel = logLevel;
    }

    #resetLogItems() {
        this.#logItems = [];
    }

    #log(fct: LogFunction, threshold: LogLevel) {
        if (this.#logItems.length > 0) {
            if (this.#logLevel <= threshold) {
                fct(...formatItems(this.#logItems));
            }

            this.#resetLogItems();
        }
    }

    getName() {
        return ConsoleLogger.name;
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

        this.#log(console.log, LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(console.log, LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(console.warn, LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(console.error, LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#logItems.push({
                text: log,
                options
            });
        }

        this.#log(console.error, LogLevel.critical);
    }

    startScope(label: string, options?: LoggerScopeOptions) {
        return new ConsoleLoggerScope(label, this.#logLevel, options);
    }
}
