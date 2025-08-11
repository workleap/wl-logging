export enum LogLevel {
    debug = 0,
    information = 1,
    warning = 2,
    error = 3,
    critical = 4
}

export interface LogOptions {
    /**
     * Style to apply to the log.
     */
    style?: Partial<CSSStyleDeclaration>;
}

export interface LogBuilder {
    /**
     * Log some text.
     */
    withText: (text: string, options?: LogOptions) => LogBuilder;

    /**
     * Log an error object.
     */
    withError: (error: Error, options?: LogOptions) => LogBuilder;

    /**
     * Log an unknown object.
     */
    withObject: (obj: object, options?: LogOptions) => LogBuilder;

    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     */
    debug: (log?: string, options?: LogOptions) => void;
    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     */
    information: (log?: string, options?: LogOptions) => void;
    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     */
    warning: (log?: string, options?: LogOptions) => void;
    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     */
    error: (log?: string, options?: LogOptions) => void;
    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     */
    critical: (log?: string, options?: LogOptions) => void;
}

export interface LoggerScopeOptions {
    /**
     * Style to apply to the label of the group when applicable.
     */
    labelStyle?: Partial<CSSStyleDeclaration>;
}

export interface LoggerScopeEndOptions {
    /**
     * Style to apply to the label of the group when applicable.
     */
    labelStyle?: Partial<CSSStyleDeclaration>;

    /**
     * Whether or not to dismiss the scope without logging anything.
     */
    dismiss?: boolean;
}

export interface LoggerScope extends LogBuilder {
    /**
     * End the scope.
     */
    end: (options?: LoggerScopeEndOptions) => void;
}

export interface Logger extends LogBuilder {
    getName: () => string;

    /**
     * Start a new logging scope. The scope will inherit the LogLevel of the root logger.
     * @param label The label of scope, usually displayed into the log.
     */
    startScope: (label: string, options?: LoggerScopeOptions) => LoggerScope;
}

export interface LogItem {
    text?: string;
    error?: Error;
    obj?: unknown;
    options?: LogOptions;
}

export interface TextItem {
    text: string;
    options?: LogOptions;
}
