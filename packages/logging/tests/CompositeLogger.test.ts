import { afterEach, describe, test, vi } from "vitest";
import { BrowserConsoleLogger, BrowserConsoleLoggerScope } from "../src/BrowserConsoleLogger.ts";
import { CompositeLogger, CompositeLoggerScope } from "../src/CompositeLogger.ts";
import { LogLevel } from "../src/Logger.ts";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("CompositeLogger", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof CompositeLogger, keyof typeof console, boolean[]][]
    )("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof CompositeLogger, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel }), new BrowserConsoleLogger({ logLevel })]);
            const logValue = "foo";

            logger[loggerFunction](logValue);

            const expectedResult = expectedResults[logLevel];

            if (expectedResult === undefined) {
                throw new Error(`There's no expected result for logLevel: "${logLevel}".`);
            }

            if (expectedResult) {
                expect(logMock).toHaveBeenCalledTimes(2);
                expect(logMock).toHaveBeenCalledWith(logValue);
            } else {
                expect(logMock).not.toHaveBeenCalled();
            }
        });
    });

    describe("builder", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof CompositeLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);

            logger
                .withText("Hello")
                .withText("World")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith("Hello World");
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);
            const obj = { name: "John", age: 30 };

            logger
                .withText("User:")
                .withObject(obj)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(
                "User:",
                obj
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);
            const error = new Error("Test error");

            logger
                .withText("Error occurred:")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(
                "Error occurred:",
                error
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);
            const obj = { name: "John", age: 30 };
            const error = new Error("Test error");

            logger
                .withText("Processing segment")
                .withLineChange()
                .withText("on multiple lines")
                .withObject(obj)
                .withLineChange()
                .withText("failed with error")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(
                "Processing segment",
                "\r\n",
                "on multiple lines",
                obj,
                "\r\n",
                "failed with error",
                error
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with mixed segments", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withText("Processing segment")
                .withObject(obj)
                .withText("failed with error")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(
                "Processing segment",
                obj,
                "failed with error",
                error
            );
        });
    });

    describe("styling", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof CompositeLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);

            logger
                .withText("Styled text", { style: { color: "red", fontWeight: "bold" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(
                "%cStyled text%c",
                "color:red;font-weight:bold",
                "%s"
            );
        });
    });

    describe("scope", () => {
        test.concurrent("starting a scope always return a new instance", ({ expect }) => {
            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);

            const scope1 = logger.startScope("foo");
            const scope2 = logger.startScope("bar");

            expect(scope1).not.toBe(scope2);
        });

        test.concurrent("a scope inherit from the root logger log level", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.error }), new BrowserConsoleLogger({ logLevel: LogLevel.error })]);
            const scope = logger.startScope("foo");

            scope.information("bar");
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when a scope is started, the root logger can still write logs", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new CompositeLogger([new BrowserConsoleLogger({ logLevel: LogLevel.debug }), new BrowserConsoleLogger({ logLevel: LogLevel.debug })]);
            const logValue = "bar";

            logger.startScope("foo");
            logger.information(logValue);

            expect(logMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledWith(logValue);
        });
    });
});

describe("CompositeLoggerScope", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof CompositeLoggerScope, keyof typeof console, boolean[]][])("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof CompositeLoggerScope, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", logLevel), new BrowserConsoleLoggerScope("foo", logLevel)]);
            const logValue = "bar";

            scope[loggerFunction](logValue);
            scope.end();

            const expectedResult = expectedResults[logLevel];

            if (expectedResult === undefined) {
                throw new Error(`There's no expected result for logLevel: "${logLevel}".`);
            }

            if (expectedResult) {
                expect(logMock).toHaveBeenCalledTimes(2);
                expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
                expect(groupEndMock).toHaveBeenCalledTimes(2);
            } else {
                expect(logMock).not.toHaveBeenCalled();
                expect(groupCollapsedMock).not.toHaveBeenCalled();
                expect(groupEndMock).not.toHaveBeenCalled();
            }
        });
    });

    describe("builder", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof CompositeLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);

            scope
                .withText("Hello")
                .withText("World")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith("Hello World");
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);
            const obj = { name: "John", age: 30 };

            scope
                .withText("User:")
                .withObject(obj)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith(
                "User:",
                obj
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);
            const error = new Error("Test error");

            scope
                .withText("Error occurred:")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith(
                "Error occurred:",
                error
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);
            const obj = { name: "John", age: 30 };
            const error = new Error("Test error");

            scope
                .withText("Processing segment")
                .withLineChange()
                .withText("on multiple lines")
                .withObject(obj)
                .withLineChange()
                .withText("failed with error")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith(
                "Processing segment",
                "\r\n",
                "on multiple lines",
                obj,
                "\r\n",
                "failed with error",
                error
            );
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with mixed segments", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);
            const obj = { id: 1 };
            const error = new Error("Test error");

            scope
                .withText("Processing segment")
                .withObject(obj)
                .withText("failed with error")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith(
                "Processing segment",
                obj,
                "failed with error",
                error
            );
        });
    });

    describe("styling", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof CompositeLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);

            scope.withText("Styled text", { style: { color: "red", fontWeight: "bold" } })[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(2);
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(groupEndMock).toHaveBeenCalledTimes(2);

            expect(logMock).toHaveBeenCalledWith(
                "%cStyled text%c",
                "color:red;font-weight:bold",
                "%s"
            );
        });
    });

    describe("end", () => {
        test.concurrent("can dismiss scopes without logging", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new CompositeLoggerScope([new BrowserConsoleLoggerScope("foo", LogLevel.debug), new BrowserConsoleLoggerScope("foo", LogLevel.debug)]);

            scope.debug("This should not appear");
            scope.end({ dismiss: true });

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(logMock).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });
    });
});


