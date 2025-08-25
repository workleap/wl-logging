import { LogLevel, type LoggerOptions, type LoggerScope, type LoggerScopeEndOptions, type LoggerScopeOptions, type LogOptions, type RootLogger } from "./Logger.ts";

interface Segment {
    type: "text" | "object" | "error" | "line-change";
    value: unknown;
    options?: LogOptions;
}

function convertCssInlineStyleToConsoleStyle(cssInlineStyle: Partial<CSSStyleDeclaration>) {
    return Object.entries(cssInlineStyle)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)}:${value}`)
        .join(";");
}

function appendText(currentText: string, newText: string, options: { leadingSpace?: boolean } = {}) {
    const {
        leadingSpace = true
    } = options;

    if (currentText.length > 0) {
        return `${currentText}${leadingSpace ? " " : ""}${newText}`;
    }

    return newText;
}

function analyzeSegments(segments: Segment[]) {
    let includeStyleOptions = false;
    let includeStyleOptionsOnFirstLine = false;
    let includeLineChange = false;

    segments.forEach(x => {
        if (x.options?.style) {
            includeStyleOptions = true;

            if (!includeLineChange) {
                includeStyleOptionsOnFirstLine = true;
            }
        }

        if (x.type === "line-change") {
            includeLineChange = true;
        }
    });

    return {
        includeStyleOptions,
        includeStyleOptionsOnFirstLine,
        includeLineChange
    };
}

function formatSegments(segments: Segment[]) {
    const {
        includeStyleOptions,
        includeStyleOptionsOnFirstLine,
        includeLineChange
    } = analyzeSegments(segments);

    // Merge all the text segments of the first line into a single string that will be forwarded to the console
    // as the first argument, followed by the styling, then the objects and errors.
    // This rendering move all objects and errors of the first line at the end, then the original order
    // is preserved for subsequent lines.
    // This rendering also implies that any text that is not on the first line
    if (includeStyleOptionsOnFirstLine && includeLineChange) {
        let firstLineText = "";

        const styling: string[] = [];
        const remainingValues: unknown[] = [];

        let visitedLineChange = false;

        segments.forEach(x => {
            // This is the first line.
            if (!visitedLineChange) {
                if (x.type === "text") {
                    if (x.options?.style) {
                        firstLineText = appendText(firstLineText, `%c${x.value}%c`, {
                            leadingSpace: x.options.leadingSpace
                        });

                        styling.push(convertCssInlineStyleToConsoleStyle(x.options.style));
                        styling.push("%s");
                    } else {
                        firstLineText = appendText(firstLineText, x.value as string, {
                            leadingSpace: x.options?.leadingSpace
                        });
                    }
                } else if (x.type === "line-change") {
                    visitedLineChange = true;

                    remainingValues.push(x.value);
                } else {
                    remainingValues.push(x.value);
                }
            } else {
                remainingValues.push(x.value);
            }
        });

        return [
            firstLineText.length > 0 ? firstLineText : undefined,
            ...styling,
            ...remainingValues
        ].filter(x => x);
    // Merge all the text segments into a single string that will be forwarded to the console
    // as the first argument, followed by the styling, then the objects and errors.
    // This rendering move all objects and errors at the end.
    } else if (includeStyleOptions && !includeLineChange) {
        let mergedText = "";

        const styling: string[] = [];
        const remainingValues: unknown[] = [];

        segments.forEach(x => {
            if (x.type === "text") {
                if (x.options?.style) {
                    mergedText = appendText(mergedText, `%c${x.value}%c`, {
                        leadingSpace: x.options.leadingSpace
                    });

                    styling.push(convertCssInlineStyleToConsoleStyle(x.options.style));
                    styling.push("%s");
                } else {
                    mergedText = appendText(mergedText, x.value as string, {
                        leadingSpace: x.options?.leadingSpace
                    });
                }
            } else {
                remainingValues.push(x.value);
            }
        });

        return [
            mergedText,
            ...styling,
            ...remainingValues
        ];
    }

    // This rendering display all the parsed values in their original order.
    return segments.map(x => x.value);
}

type LogFunction = (...rest: unknown[]) => void;
type PendingLog = () => void;

/**
 * A scope for a logger outputting messages to a browser console.
 * @see {@link https://workleap.github.io/wl-logging}
 */
export class BrowserConsoleLoggerScope implements LoggerScope {
    readonly #logLevel: LogLevel;
    readonly #label: string;
    readonly #labelStyle?: Partial<CSSStyleDeclaration>;

    #segments: Segment[] = [];
    #pendingLogs: PendingLog[] = [];
    #hasEnded: boolean = false;

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    constructor(label: string, logLevel: LogLevel, options: LoggerScopeOptions = {}) {
        this.#logLevel = logLevel;
        this.#label = label;
        this.#labelStyle = options.labelStyle;
    }

    #resetSegments() {
        this.#segments = [];
    }

    // Categorized logs (warn, error, etc..) will only show in the console when the console group is open, which is a weird
    // behavior for categorized logs such as error.
    // To alleviate the situation, those categorized logs are logged twice: one time in the group and one time at the root.
    #log(fcts: LogFunction[], threshold: LogLevel) {
        if (this.#segments.length > 0) {
            if (this.#logLevel <= threshold) {
                // Required closure to preserved the current segments for when they will be formatted when the scope is ended.
                const segments = this.#segments;

                this.#pendingLogs.push(() => {
                    const formattedSegments = formatSegments(segments);

                    fcts.forEach(x => {
                        x(...formattedSegments);
                    });
                });
            }

            this.#resetSegments();
        }
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withText(text?: string, options: LogOptions = {}) {
        if (text) {
            this.#segments.push({
                type: "text",
                value: text,
                options
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withError(error?: Error) {
        if (error) {
            this.#segments.push({
                type: "error",
                value: error
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withObject(obj?: unknown) {
        if (obj) {
            this.#segments.push({
                type: "object",
                value: obj
            });
        }

        return this;
    }

    withLineChange() {
        this.#segments.push({
            type: "line-change",
            value: "\r\n"
        });

        return this;
    }

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log([console.log], LogLevel.debug);
    }

    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log([console.log], LogLevel.information);
    }

    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log([console.log, console.warn], LogLevel.warning);
    }

    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log([console.log, console.error], LogLevel.error);
    }

    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log([console.log, console.error], LogLevel.critical);
    }

    /**
     * End the scope.
     * @see {@link https://workleap.github.io/wl-logging}
     */
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

/**
 * A logger outputting messages to a browser console.
 * @see {@link https://workleap.github.io/wl-logging}
 */
export class BrowserConsoleLogger implements RootLogger {
    readonly #logLevel: LogLevel;
    #segments: Segment[] = [];

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    constructor(options: LoggerOptions = {}) {
        const {
            logLevel = LogLevel.debug
        } = options;

        this.#logLevel = logLevel;
    }

    #resetSegments() {
        this.#segments = [];
    }

    #log(fct: LogFunction, threshold: LogLevel) {
        if (this.#segments.length > 0) {
            if (this.#logLevel <= threshold) {
                const formattedSegments = formatSegments(this.#segments);

                fct(...formattedSegments);
            }

            this.#resetSegments();
        }
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    getName() {
        return BrowserConsoleLogger.name;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withText(text?: string, options: LogOptions = {}) {
        if (text) {
            this.#segments.push({
                type: "text",
                value: text,
                options
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withError(error?: Error) {
        if (error) {
            this.#segments.push({
                type: "error",
                value: error
            });
        }

        return this;
    }

    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withObject(obj?: unknown) {
        if (obj) {
            this.#segments.push({
                type: "object",
                value: obj
            });
        }

        return this;
    }

    withLineChange() {
        this.#segments.push({
            type: "line-change",
            value: "\r\n"
        });

        return this;
    }

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log(console.log, LogLevel.debug);
    }

    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log(console.log, LogLevel.information);
    }

    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log(console.warn, LogLevel.warning);
    }

    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log(console.error, LogLevel.error);
    }

    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                type: "text",
                value: log,
                options
            });
        }

        this.#log(console.error, LogLevel.critical);
    }

    /**
     * Start a new logging scope. The scope will inherit the LogLevel of the root logger.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    startScope(label: string, options?: LoggerScopeOptions) {
        return new BrowserConsoleLoggerScope(label, this.#logLevel, options);
    }
}
