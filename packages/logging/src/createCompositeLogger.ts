import { BrowserConsoleLogger } from "./BrowserConsoleLogger.ts";
import { CompositeLogger } from "./CompositeLogger.ts";
import type { RootLogger } from "./Logger.ts";

/**
 * Create a composite logger from a standard logging API ("verbose" and "loggers" options).
 * If "verbose" is true and no loggers are provided, a BrowserConsoleLogger instance will be returned.
 * @see {@link https://workleap.github.io/wl-logging}
 */
export function createCompositeLogger(verbose: boolean, loggers: RootLogger[]) {
    if (verbose && loggers.length === 0) {
        loggers.push(new BrowserConsoleLogger());
    }

    return new CompositeLogger(loggers);
}
