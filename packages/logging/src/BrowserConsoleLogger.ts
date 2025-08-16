import { LogLevel, type LoggerOptions, type LoggerScope, type LoggerScopeEndOptions, type LoggerScopeOptions, type LogOptions, type RootLogger, type Segment } from "./Logger.ts";

interface TextSegment {
    text: string;
    options?: LogOptions;
}

function convertCssInlineStyleToConsoleStyle(cssInlineStyle: Partial<CSSStyleDeclaration>) {
    return Object.entries(cssInlineStyle)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)}:${value}`)
        .join(";");
}

function appendTextSegment(currentText: string, segment: string) {
    if (currentText.length > 0) {
        return `${currentText} ${segment}`;
    }

    return segment;
}

function parseSegments(segments: Segment[]) {
    const textSegments: TextSegment[] = [];
    const objectSegments: unknown[] = [];
    const allSegments: unknown[] = [];

    let includeStyleOptions = false;

    segments.forEach(x => {
        if (x.options?.style) {
            includeStyleOptions = true;
        }

        if (x.text) {
            textSegments.push(x as TextSegment);
            allSegments.push(x.text);
        } else if (x.obj) {
            objectSegments.push(x.obj);
            allSegments.push(x.obj);
        } else if (x.error) {
            objectSegments.push(x.error);
            allSegments.push(x.error);
        }
    });

    return {
        textSegments,
        objectSegments,
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
        objectSegments,
        allSegments,
        includeStyleOptions
    } = parseSegments(segments);

    // There's some style, merge all the text into a single string.
    if (includeStyleOptions) {
        let text = "";

        const styling: string[] = [];

        textSegments.forEach(x => {
            if (x.options?.style) {
                text = appendTextSegment(text, `%c${x.text}%c`);

                styling.push(convertCssInlineStyleToConsoleStyle(x.options.style));
                styling.push("%s");
            } else {
                text = appendTextSegment(text, x.text);
            }
        });

        return [
            text,
            ...styling,
            ...objectSegments
        ];
    }

    // There's no style, preserve the original sequencing.
    return allSegments;
}

type LogFunction = (...rest: unknown[]) => void;
type PendingLog = () => void;

export class BrowserConsoleLoggerScope implements LoggerScope {
    readonly #logLevel: LogLevel;
    readonly #label: string;
    readonly #labelStyle?: Partial<CSSStyleDeclaration>;

    #segments: Segment[] = [];
    #pendingLogs: PendingLog[] = [];
    #hasEnded: boolean = false;

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

    withText(text: string, options: LogOptions = {}) {
        this.#segments.push({
            text,
            options
        });

        return this;
    }

    withError(error: Error) {
        this.#segments.push({
            error
        });

        return this;
    }

    withObject(obj: object) {
        this.#segments.push({
            obj
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log([console.log], LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log([console.log], LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log([console.log, console.warn], LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log([console.log, console.error], LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
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

export class BrowserConsoleLogger implements RootLogger {
    readonly #logLevel: LogLevel;
    #segments: Segment[] = [];

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
                fct(...formatSegments(this.#segments));
            }

            this.#resetSegments();
        }
    }

    getName() {
        return BrowserConsoleLogger.name;
    }

    withText(text: string, options: LogOptions = {}) {
        this.#segments.push({
            text,
            options
        });

        return this;
    }

    withError(error: Error) {
        this.#segments.push({
            error
        });

        return this;
    }

    withObject(obj: object) {
        this.#segments.push({
            obj
        });

        return this;
    }

    debug(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log(console.log, LogLevel.debug);
    }

    information(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log(console.log, LogLevel.information);
    }

    warning(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log(console.warn, LogLevel.warning);
    }

    error(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log(console.error, LogLevel.error);
    }

    critical(log?: string, options?: LogOptions) {
        if (log) {
            this.#segments.push({
                text: log,
                options
            });
        }

        this.#log(console.error, LogLevel.critical);
    }

    startScope(label: string, options?: LoggerScopeOptions) {
        return new BrowserConsoleLoggerScope(label, this.#logLevel, options);
    }
}
