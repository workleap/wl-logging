export enum LogLevel {
    debug = 0,
    information = 1,
    warning = 2,
    error = 3,
    critical = 4
}

export interface LoggerMethods {
    /**
     * Write a debug log. The log will be processed only if the logger LogLevel is >= debug.
     */
    debug: (log: string, ...rest: unknown[]) => void;
    /**
     * Write an information log. The log will be processed only if the logger LogLevel is >= information.
     */
    information: (log: string, ...rest: unknown[]) => void;
    /**
     * Write a warning log. The log will be processed only if the logger LogLevel is >= warning.
     */
    warning: (log: string, ...rest: unknown[]) => void;
    /**
     * Write an error log. The log will be processed only if the logger LogLevel is >= error.
     */
    error: (log: string, ...rest: unknown[]) => void;
    /**
     * Write a critical log. The log will be processed only if the logger LogLevel is >= critical.
     */
    critical: (log: string, ...rest: unknown[]) => void;
}

export interface EndLoggerScopeOptions {
    /**
     * Whether or not to dismiss the scope without logging anything.
     */
    dismiss?: boolean;

    // Allows unknown keys with any value.
    [key: string]: unknown;
}

export interface LoggerScope extends LoggerMethods {
    /**
     * End the scope.
     */
    end: (options?: EndLoggerScopeOptions) => void;
}

export interface Logger extends LoggerMethods {
    getName: () => string;

    /**
     * Start a new logging scope. The scope will inherit the LogLevel of the root logger.
     * @param label The label of scope, usually displayed into the log.
     */
    startScope: (label: string) => LoggerScope;
}
