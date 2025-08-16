import { BrowserConsoleLogger } from "./BrowserConsoleLogger.ts";
import { CompositeLogger } from "./CompositeLogger.ts";
import type { RootLogger } from "./Logger.ts";

export function createCompositeLogger(verbose: boolean, loggers: RootLogger[]) {
    if (verbose && loggers.length === 0) {
        loggers.push(new BrowserConsoleLogger());
    }

    return new CompositeLogger(loggers);
}
