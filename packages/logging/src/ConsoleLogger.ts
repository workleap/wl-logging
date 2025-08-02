import { LogLevel, type EndLoggerScopeOptions, type Logger, type LoggerScope } from "./Logger.ts";

type Log = () => void;

export interface EndConsoleLoggerScopeOptions extends EndLoggerScopeOptions {
    /**
     * Optionally specify the text color of the scope label.
     */
    color?: string;
}

export class ConsoleLoggerScope implements LoggerScope {
    readonly #logLevel: LogLevel;
    readonly #label: string;

    #logs: Log[] = [];
    #hasEnded: boolean = false;

    constructor(label: string, logLevel: LogLevel) {
        this.#logLevel = logLevel;
        this.#label = label;
    }

    #log(log: Log, threshold: LogLevel, additionalLog?: Log) {
        if (!this.#hasEnded) {
            if (this.#logLevel <= threshold) {
                this.#logs.push(log);

                // Categorized logs will only show in the console when the console group is open, which is quite a weird
                // behavior for categorized logs such as error.
                // To alleviate the situation, those categorized logs are logged twice: one time in the group and one time at the root.
                if (additionalLog) {
                    additionalLog();
                }
            }
        }
    }

    debug(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(log, ...rest), LogLevel.debug);
    }

    information(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(log, ...rest), LogLevel.information);
    }

    warning(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(`%c${log}`, "color: yellow;", ...rest), LogLevel.warning, () => console.warn(log, ...rest));
    }

    error(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(`%c${log}`, "color: red;", ...rest), LogLevel.error, () => console.error(log, ...rest));
    }

    critical(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(`%c${log}`, "color: red;", ...rest), LogLevel.critical, () => console.error(log, ...rest));
    }

    end(options: EndConsoleLoggerScopeOptions = {}) {
        const {
            color,
            dismiss = false
        } = options;

        if (!this.#hasEnded) {
            this.#hasEnded = true;

            if (!dismiss) {
                if (this.#logs.length > 0) {
                    const label = color ? [`%c${this.#label}`, `color: ${color};`] : [this.#label];

                    console.groupCollapsed(...label);

                    this.#logs.forEach(x => {
                        x();
                    });

                    this.#logs = [];

                    console.groupEnd();
                }
            }
        }
    }
}

export class ConsoleLogger implements Logger {
    readonly #logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.debug) {
        this.#logLevel = logLevel;
    }

    getName() {
        return ConsoleLogger.name;
    }

    #log(log: Log, threshold: LogLevel) {
        if (this.#logLevel <= threshold) {
            log();
        }
    }

    debug(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(log, ...rest), LogLevel.debug);
    }

    information(log: string, ...rest: unknown[]) {
        return this.#log(() => console.log(log, ...rest), LogLevel.information);
    }

    warning(log: string, ...rest: unknown[]) {
        return this.#log(() => console.warn(log, ...rest), LogLevel.warning);
    }

    error(log: string, ...rest: unknown[]) {
        return this.#log(() => console.error(log, ...rest), LogLevel.error);
    }

    critical(log: string, ...rest: unknown[]) {
        return this.#log(() => console.error(log, ...rest), LogLevel.critical);
    }

    startScope(label: string) {
        return new ConsoleLoggerScope(label, this.#logLevel);
    }
}
