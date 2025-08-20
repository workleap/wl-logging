/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export enum LogLevel {
    debug = 0,
    information = 1,
    warning = 2,
    error = 3,
    critical = 4
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface LogOptions {
    /**
     * Style to apply to the log.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    style?: Partial<CSSStyleDeclaration>;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface Logger {
    /**
     * Log some text.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withText: (text?: string, options?: LogOptions) => Logger;

    /**
     * Log an error object.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withError: (error?: Error, options?: LogOptions) => Logger;

    /**
     * Log an unknown object.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withObject: (obj?: unknown, options?: LogOptions) => Logger;

    /**
     * Add line change characters.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    withLineChange: () => Logger;

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    debug: (log?: string, options?: LogOptions) => void;
    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    information: (log?: string, options?: LogOptions) => void;
    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    warning: (log?: string, options?: LogOptions) => void;
    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    error: (log?: string, options?: LogOptions) => void;
    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    critical: (log?: string, options?: LogOptions) => void;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface LoggerOptions {
    /**
     * The the minimum severity of messages that will be logged. Default is "debug".
     * @see {@link https://workleap.github.io/wl-logging}
     */
    logLevel?: LogLevel;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface LoggerScopeOptions {
    /**
     * Style to apply to the label of the group for loggers that support styling.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    labelStyle?: Partial<CSSStyleDeclaration>;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface LoggerScopeEndOptions {
    /**
     * Style to apply to the label of the group for loggers that support styling.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    labelStyle?: Partial<CSSStyleDeclaration>;

    /**
     * Whether or not to dismiss the scope without logging anything.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    dismiss?: boolean;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface LoggerScope extends Logger {
    /**
     * End the scope.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    end: (options?: LoggerScopeEndOptions) => void;
}

/**
 * @see {@link https://workleap.github.io/wl-logging}
 */
export interface RootLogger extends Logger {
    /**
     * @see {@link https://workleap.github.io/wl-logging}
     */
    getName: () => string;

    /**
     * Start a new logging scope. The scope will inherit the LogLevel of the root logger.
     * @see {@link https://workleap.github.io/wl-logging}
     */
    startScope: (label: string, options?: LoggerScopeOptions) => LoggerScope;
}

export interface Segment {
    text?: string;
    error?: Error;
    obj?: unknown;
    lineChange?: boolean;
    options?: LogOptions;
}
