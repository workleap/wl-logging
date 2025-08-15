import { CompositeLogger } from "./CompositeLogger.ts";
import { ConsoleLogger } from "./ConsoleLogger.ts";
import type { RootLogger } from "./Logger.ts";

export function createCompositeLogger(verbose: boolean, loggers: RootLogger[]) {
    if (verbose && loggers.length === 0) {
        loggers.push(new ConsoleLogger());
    }

    return new CompositeLogger(loggers);
}
