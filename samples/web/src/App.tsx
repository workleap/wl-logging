import { CompositeLogger, CompositeLoggerScope, ConsoleLogger, ConsoleLoggerScope } from "@workleap/logging";
import { LogRocketLogger, LogRocketLoggerScope } from "@workleap/logrocket-logger";
import { useCallback, useState } from "react";

function getShortId() {
    return crypto.randomUUID().slice(0, 8);
}

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
}

function generateRandomObject() {
    const id = Math.floor(Math.random() * 1000);
    const value = Math.random().toString(36).substring(2, 8);

    return { id, value };
}

function generateRandomError(): Error {
    const messages = [
        "Something went wrong",
        "Unexpected failure",
        "Unknown error occurred",
        "Operation timed out",
        "Internal server error"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return new Error(randomMessage);
}

//////////////////////

const consoleLogger = new ConsoleLogger();

function useConsoleLogCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        consoleLogger[level]();
    }, []);
}

function useConsoleLogWithTextCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        consoleLogger[level](`Log: ${getShortId()}`);
    }, []);
}

function ConsoleLoggerSection() {
    const handleTextClick = useCallback(() => {
        consoleLogger.withText(`Text: ${getShortId()}`);
    }, []);

    const handleColoredTextClick = useCallback(() => {
        consoleLogger.withText(getShortId(), {
            style: {
                color: getRandomHexColor()
            }
        });
    }, []);

    const handleColoredBackgroundClick = useCallback(() => {
        consoleLogger.withText(getShortId(), {
            style: {
                backgroundColor: getRandomHexColor(),
                color: "white"
            }
        });
    }, []);

    const handleBoldTextClick = useCallback(() => {
        consoleLogger.withText(`Text: ${getShortId()}`, {
            style: {
                fontWeight: "bold"
            }
        });
    }, []);

    const handleObjectClick = useCallback(() => {
        consoleLogger.withObject(generateRandomObject());
    }, []);

    const handleErrorClick = useCallback(() => {
        consoleLogger.withError(generateRandomError());
    }, []);

    return (
        <>
            <h2>Console Logger</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleColoredTextClick}>Colored text</button>
                    <button type="button" onClick={handleColoredBackgroundClick}>Colored background</button>
                    <button type="button" onClick={handleBoldTextClick}>Bold text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleLogCallback("debug")}>Debug</button>
                    <button type="button" onClick={useConsoleLogWithTextCallback("debug")}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleLogCallback("information")}>Information</button>
                    <button type="button" onClick={useConsoleLogWithTextCallback("information")}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleLogCallback("warning")}>Warning</button>
                    <button type="button" onClick={useConsoleLogWithTextCallback("warning")}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleLogCallback("error")}>Error</button>
                    <button type="button" onClick={useConsoleLogWithTextCallback("error")}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleLogCallback("critical")}>Critical</button>
                    <button type="button" onClick={useConsoleLogWithTextCallback("critical")}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

function useConsoleScopeLogCallback(level: string, scope?: ConsoleLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level]();
    }, [scope]);
}

function useConsoleScopeLogWithTextCallback(level: string, scope?: ConsoleLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level](`Log: ${getShortId()}`);
    }, [scope]);
}

function ConsoleLoggerScopeSection() {
    const [scope, setScope] = useState<ConsoleLoggerScope>();

    const handleCreateScopeClick = useCallback(() => {
        if (scope) {
            scope.end({ dismiss: true });
        }

        setScope(consoleLogger.startScope(getShortId()));
    }, [scope]);

    const handleCreateColoredScopeClick = useCallback(() => {
        if (scope) {
            scope.end({ dismiss: true });
        }

        setScope(consoleLogger.startScope(getShortId(), {
            labelStyle: {
                color: getRandomHexColor()
            }
        }));
    }, [scope]);

    const handleEndScopeClick = useCallback(() => {
        scope?.end();
        setScope(undefined);
    }, [scope]);

    const handleEndScopeWithStyleClick = useCallback(() => {
        scope?.end({
            labelStyle: {
                color: getRandomHexColor()
            }
        });

        setScope(undefined);
    }, [scope]);

    const handleTextClick = useCallback(() => {
        scope?.withText(`Text: ${getShortId()}`);
    }, [scope]);

    const handleColoredTextClick = useCallback(() => {
        scope?.withText(getShortId(), {
            style: {
                color: getRandomHexColor()
            }
        });
    }, [scope]);

    const handleColoredBackgroundClick = useCallback(() => {
        scope?.withText(getShortId(), {
            style: {
                backgroundColor: getRandomHexColor(),
                color: "white"
            }
        });
    }, [scope]);

    const handleBoldTextClick = useCallback(() => {
        scope?.withText(`Text: ${getShortId()}`, {
            style: {
                fontWeight: "bold"
            }
        });
    }, [scope]);

    const handleObjectClick = useCallback(() => {
        scope?.withObject(generateRandomObject());
    }, [scope]);

    const handleErrorClick = useCallback(() => {
        scope?.withError(generateRandomError());
    }, [scope]);

    return (
        <>
            <h3>Scope</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleCreateScopeClick}>Create scope</button>
                    <button type="button" onClick={handleCreateColoredScopeClick}>Create colored scope</button>
                    <button type="button" onClick={handleEndScopeClick}>End scope</button>
                    <button type="button" onClick={handleEndScopeWithStyleClick}>End scope with style</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleColoredTextClick}>Colored text</button>
                    <button type="button" onClick={handleColoredBackgroundClick}>Colored background</button>
                    <button type="button" onClick={handleBoldTextClick}>Bold text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleScopeLogCallback("debug", scope)}>Debug</button>
                    <button type="button" onClick={useConsoleScopeLogWithTextCallback("debug", scope)}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleScopeLogCallback("information", scope)}>Information</button>
                    <button type="button" onClick={useConsoleScopeLogWithTextCallback("information", scope)}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleScopeLogCallback("warning", scope)}>Warning</button>
                    <button type="button" onClick={useConsoleScopeLogWithTextCallback("warning", scope)}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleScopeLogCallback("error", scope)}>Error</button>
                    <button type="button" onClick={useConsoleScopeLogWithTextCallback("error", scope)}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useConsoleScopeLogCallback("critical", scope)}>Critical</button>
                    <button type="button" onClick={useConsoleScopeLogWithTextCallback("critical", scope)}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

const logRocketLogger = new LogRocketLogger();

function useLogRocketLogCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        logRocketLogger[level]();
    }, []);
}

function useLogRocketLogWithTextCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        logRocketLogger[level](`Log: ${getShortId()}`);
    }, []);
}

function LogRocketLoggerSection() {
    const handleTextClick = useCallback(() => {
        logRocketLogger.withText(`Text: ${getShortId()}`);
    }, []);

    const handleObjectClick = useCallback(() => {
        logRocketLogger.withObject(generateRandomObject());
    }, []);

    const handleErrorClick = useCallback(() => {
        logRocketLogger.withError(generateRandomError());
    }, []);

    return (
        <>
            <h2>LogRocket Logger</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketLogCallback("debug")}>Debug</button>
                    <button type="button" onClick={useLogRocketLogWithTextCallback("debug")}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketLogCallback("information")}>Information</button>
                    <button type="button" onClick={useLogRocketLogWithTextCallback("information")}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketLogCallback("warning")}>Warning</button>
                    <button type="button" onClick={useLogRocketLogWithTextCallback("warning")}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketLogCallback("error")}>Error</button>
                    <button type="button" onClick={useLogRocketLogWithTextCallback("error")}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketLogCallback("critical")}>Critical</button>
                    <button type="button" onClick={useLogRocketLogWithTextCallback("critical")}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

function useLogRocketScopeLogCallback(level: string, scope?: LogRocketLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level]();
    }, [scope]);
}

function useLogRocketScopeLogWithTextCallback(level: string, scope?: LogRocketLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level](`Log: ${getShortId()}`);
    }, [scope]);
}

function LogRocketLoggerScopeSection() {
    const [scope, setScope] = useState<LogRocketLoggerScope>();

    const handleCreateScopeClick = useCallback(() => {
        if (scope) {
            scope.end({ dismiss: true });
        }

        setScope(logRocketLogger.startScope(getShortId()));
    }, [scope]);

    const handleEndScopeClick = useCallback(() => {
        scope?.end();
        setScope(undefined);
    }, [scope]);

    const handleTextClick = useCallback(() => {
        scope?.withText(`Text: ${getShortId()}`);
    }, [scope]);

    const handleObjectClick = useCallback(() => {
        scope?.withObject(generateRandomObject());
    }, [scope]);

    const handleErrorClick = useCallback(() => {
        scope?.withError(generateRandomError());
    }, [scope]);

    return (
        <>
            <h3>Scope</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleCreateScopeClick}>Create scope</button>
                    <button type="button" onClick={handleEndScopeClick}>End scope</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketScopeLogCallback("debug", scope)}>Debug</button>
                    <button type="button" onClick={useLogRocketScopeLogWithTextCallback("debug", scope)}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketScopeLogCallback("information", scope)}>Information</button>
                    <button type="button" onClick={useLogRocketScopeLogWithTextCallback("information", scope)}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketScopeLogCallback("warning", scope)}>Warning</button>
                    <button type="button" onClick={useLogRocketScopeLogWithTextCallback("warning", scope)}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketScopeLogCallback("error", scope)}>Error</button>
                    <button type="button" onClick={useLogRocketScopeLogWithTextCallback("error", scope)}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useLogRocketScopeLogCallback("critical", scope)}>Critical</button>
                    <button type="button" onClick={useLogRocketScopeLogWithTextCallback("critical", scope)}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

const compositeLogger = new CompositeLogger([
    new ConsoleLogger(),
    new LogRocketLogger()
]);

function useCompositeLogCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        compositeLogger[level]();
    }, []);
}

function useCompositeLogWithTextCallback(level: string) {
    return useCallback(() => {
        // @ts-ignore
        compositeLogger[level](`Log: ${getShortId()}`);
    }, []);
}

export function CompositeLoggerSection() {
    const handleTextClick = useCallback(() => {
        compositeLogger.withText(`Text: ${getShortId()}`);
    }, []);

    const handleColoredTextClick = useCallback(() => {
        compositeLogger.withText(getShortId(), {
            style: {
                color: getRandomHexColor()
            }
        });
    }, []);

    const handleColoredBackgroundClick = useCallback(() => {
        compositeLogger.withText(getShortId(), {
            style: {
                backgroundColor: getRandomHexColor(),
                color: "white"
            }
        });
    }, []);

    const handleBoldTextClick = useCallback(() => {
        compositeLogger.withText(`Text: ${getShortId()}`, {
            style: {
                fontWeight: "bold"
            }
        });
    }, []);

    const handleObjectClick = useCallback(() => {
        compositeLogger.withObject(generateRandomObject());
    }, []);

    const handleErrorClick = useCallback(() => {
        compositeLogger.withError(generateRandomError());
    }, []);

    return (
        <>
            <h2>Composite Logger</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleColoredTextClick}>Colored text</button>
                    <button type="button" onClick={handleColoredBackgroundClick}>Colored background</button>
                    <button type="button" onClick={handleBoldTextClick}>Bold text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeLogCallback("debug")}>Debug</button>
                    <button type="button" onClick={useCompositeLogWithTextCallback("debug")}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeLogCallback("information")}>Information</button>
                    <button type="button" onClick={useCompositeLogWithTextCallback("information")}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeLogCallback("warning")}>Warning</button>
                    <button type="button" onClick={useCompositeLogWithTextCallback("warning")}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeLogCallback("error")}>Error</button>
                    <button type="button" onClick={useCompositeLogWithTextCallback("error")}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeLogCallback("critical")}>Critical</button>
                    <button type="button" onClick={useCompositeLogWithTextCallback("critical")}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

function useCompositeScopeLogCallback(level: string, scope?: CompositeLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level]();
    }, [scope]);
}

function useCompositeScopeLogWithTextCallback(level: string, scope?: CompositeLoggerScope) {
    return useCallback(() => {
        // @ts-ignore
        scope?.[level](`Log: ${getShortId()}`);
    }, [scope]);
}

function CompositeLoggerScopeSection() {
    const [scope, setScope] = useState<CompositeLoggerScope>();

    const handleCreateScopeClick = useCallback(() => {
        if (scope) {
            scope.end({ dismiss: true });
        }

        setScope(compositeLogger.startScope(getShortId()));
    }, [scope]);

    const handleCreateColoredScopeClick = useCallback(() => {
        if (scope) {
            scope.end({ dismiss: true });
        }

        setScope(compositeLogger.startScope(getShortId(), {
            labelStyle: {
                color: getRandomHexColor()
            }
        }));
    }, [scope]);

    const handleEndScopeClick = useCallback(() => {
        scope?.end();
        setScope(undefined);
    }, [scope]);

    const handleEndScopeWithStyleClick = useCallback(() => {
        scope?.end({
            labelStyle: {
                color: getRandomHexColor()
            }
        });

        setScope(undefined);
    }, [scope]);

    const handleTextClick = useCallback(() => {
        scope?.withText(`Text: ${getShortId()}`);
    }, [scope]);

    const handleColoredTextClick = useCallback(() => {
        scope?.withText(getShortId(), {
            style: {
                color: getRandomHexColor()
            }
        });
    }, [scope]);

    const handleColoredBackgroundClick = useCallback(() => {
        scope?.withText(getShortId(), {
            style: {
                backgroundColor: getRandomHexColor(),
                color: "white"
            }
        });
    }, [scope]);

    const handleBoldTextClick = useCallback(() => {
        scope?.withText(`Text: ${getShortId()}`, {
            style: {
                fontWeight: "bold"
            }
        });
    }, [scope]);

    const handleObjectClick = useCallback(() => {
        scope?.withObject(generateRandomObject());
    }, [scope]);

    const handleErrorClick = useCallback(() => {
        scope?.withError(generateRandomError());
    }, [scope]);

    return (
        <>
            <h3>Scope</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleCreateScopeClick}>Create scope</button>
                    <button type="button" onClick={handleCreateColoredScopeClick}>Create colored scope</button>
                    <button type="button" onClick={handleEndScopeClick}>End scope</button>
                    <button type="button" onClick={handleEndScopeWithStyleClick}>End scope with style</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={handleTextClick}>Text</button>
                    <button type="button" onClick={handleColoredTextClick}>Colored text</button>
                    <button type="button" onClick={handleColoredBackgroundClick}>Colored background</button>
                    <button type="button" onClick={handleBoldTextClick}>Bold text</button>
                    <button type="button" onClick={handleObjectClick}>Object</button>
                    <button type="button" onClick={handleErrorClick}>Error</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeScopeLogCallback("debug", scope)}>Debug</button>
                    <button type="button" onClick={useCompositeScopeLogWithTextCallback("debug", scope)}>Debug with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeScopeLogCallback("information", scope)}>Information</button>
                    <button type="button" onClick={useCompositeScopeLogWithTextCallback("information", scope)}>Information with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeScopeLogCallback("warning", scope)}>Warning</button>
                    <button type="button" onClick={useCompositeScopeLogWithTextCallback("warning", scope)}>Warning with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeScopeLogCallback("error", scope)}>Error</button>
                    <button type="button" onClick={useCompositeScopeLogWithTextCallback("error", scope)}>Error with text</button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" onClick={useCompositeScopeLogCallback("critical", scope)}>Critical</button>
                    <button type="button" onClick={useCompositeScopeLogWithTextCallback("critical", scope)}>Critical with text</button>
                </div>
            </div>
        </>
    )
}

//////////////////////

export function App() {
    return (
        <>
            <ConsoleLoggerSection />
            <ConsoleLoggerScopeSection />
            <LogRocketLoggerSection />
            <LogRocketLoggerScopeSection />
            <CompositeLoggerSection />
            <CompositeLoggerScopeSection />
        </>
    )
}
