import { LogLevel, type LoggerOptions, type LoggerScope, type LoggerScopeEndOptions, type LoggerScopeOptions, type LogOptions, type RootLogger, type Segment } from "./Logger.ts";

interface TextSegment {
    text: string;
    isLineChange?: boolean;
    options?: LogOptions;
}

function convertCssInlineStyleToConsoleStyle(cssInlineStyle: Partial<CSSStyleDeclaration>) {
    return Object.entries(cssInlineStyle)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)}:${value}`)
        .join(";");
}

function appendText(currentText: string, newText: string, options: { addSpace?: boolean } = {}) {
    const {
        addSpace = true
    } = options;

    if (currentText.length > 0) {
        return `${currentText}${addSpace ? " " : ""}${newText}`;
    }

    return newText;
}

function parseSegments(segments: Segment[]) {
    const textSegments: TextSegment[] = [];
    const otherSegments: unknown[] = [];
    const allSegments: unknown[] = [];

    // Is there at least one items that includes styling options?
    const includeStyleOptions = segments.some(x => x.options?.style);

    segments.forEach((x, index) => {
        if (x.text) {
            textSegments.push(x as TextSegment);
            allSegments.push(x.text);
        } else if (x.obj) {
            otherSegments.push(x.obj);
            allSegments.push(x.obj);
        } else if (x.error) {
            otherSegments.push(x.error);
            allSegments.push(x.error);
        } else if (x.lineChange) {
            const lineChange = "\r\n";

            // If there are style associated to this log entry and the current segment is not the last one...
            if (includeStyleOptions && (index + 1) <= segments.length) {
                // And the next segment is a text segment...
                if (segments[index + 1].text) {
                    // Append the line change segment as a text segment so it's merged with the other text segments.
                    textSegments.push({
                        text: lineChange,
                        isLineChange: true
                    });
                } else {
                    // Otherwise, add it to the other segments.
                    otherSegments.push(lineChange);
                }
            }

            allSegments.push(lineChange);
        }
    });

    return {
        textSegments,
        otherSegments,
        allSegments,
        includeStyleOptions
    };
}

// If the text logs include style, all the text segments must be merged as a single string that will be returned as the first element of the array,
// followed by segments for the included style.
// This is done this way because the console functions expect all the styled text to be provided as the first argument, followed by the style segments.
// Therefore, when there's styling, the original text / object / error sequencing is not preserved as object and error segments are moved at the end.
// When there's no style, the original sequencing is preserved.
function formatSegments(segments: Segment[]) {
    const {
        textSegments,
        otherSegments,
        allSegments,
        includeStyleOptions
    } = parseSegments(segments);

    // There's some style, merge all the text into a single string,
    // Move all other segments at the end,
    // Do not add spaces before and after line changes.
    if (includeStyleOptions) {
        let text = "";
        let previousTextSegment: TextSegment;

        const styling: string[] = [];

        textSegments.forEach(x => {
            if (x.options?.style) {
                // Do not add a space after line change characters.
                const addSpace = !previousTextSegment?.isLineChange;

                text = appendText(text, `%c${x.text}%c`, {
                    addSpace
                });

                styling.push(convertCssInlineStyleToConsoleStyle(x.options.style));
                styling.push("%s");
            } else {
                // Do not add a space before line change characters.
                let addSpace = !x.isLineChange;

                // Do not add a space after line change characters.
                if (previousTextSegment?.isLineChange) {
                    addSpace = false;
                }

                text = appendText(text, x.text, {
                    addSpace
                });
            }

            previousTextSegment = x;
        });

        return [
            text,
            ...styling,
            ...otherSegments
        ];
    }

    // There's no style, preserve the original sequencing.
    return allSegments;
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
                text,
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
                error
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
                obj
            });
        }

        return this;
    }

    withLineChange() {
        this.#segments.push({
            lineChange: true
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
                text: log,
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
                text: log,
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
                text: log,
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
                text: log,
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
                text: log,
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
                text,
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
                error
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
                obj
            });
        }

        return this;
    }

    withLineChange() {
        this.#segments.push({
            lineChange: true
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
                text: log,
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
                text: log,
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
                text: log,
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
                text: log,
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
                text: log,
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
