import { afterEach, describe, it, test, vi } from "vitest";
import { ConsoleLogger, ConsoleLoggerScope } from "../src/ConsoleLogger.ts";
import { LogLevel } from "../src/Logger.ts";

afterEach(() => {
    vi.restoreAllMocks();
})

describe("ConsoleLogger", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof ConsoleLogger, keyof typeof console, boolean[]][]
    )("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof ConsoleLogger, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel });
            const logValue = "foo";

            logger[loggerFunction](logValue);

            const expectedResult = expectedResults[logLevel];

            if (expectedResult === undefined) {
                throw new Error(`There's no expected result for logLevel: "${logLevel}".`);
            }

            if (expectedResult) {
                expect(logMock).toHaveBeenCalledOnce();
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
        ] satisfies [keyof ConsoleLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Hello").withText(" World")[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("Hello", " World");
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { name: "John", age: 30 };

            logger.withText("User:").withObject(obj)[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("User:", obj);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const error = new Error("Test error");

            logger.withText("Error occurred:").withError(error)[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("Error occurred:", error);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with mixed items", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withText("Processing item")
                .withObject(obj)
                .withText("failed with error")
                .withError(error)
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            // The sequencing has been preserved because there's no styling.
            expect(logMock).toHaveBeenCalledWith("Processing item", obj, "failed with error", error);
        });
    });

    describe("styling", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof ConsoleLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Styled text", { style: { color: "red", fontWeight: "bold" } })[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        test.concurrent.for(pairs)("can handle multiple styled text items with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                "%cRed text%c %cBlue text%c",
                "color:red",
                "%s",
                "color:blue",
                "%s"
            );
        });

        test.concurrent.for(pairs)("can mix styled and unstyled text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                "Normal text %cStyled text%c More normal text",
                "color:green",
                "%s"
            );
        });

        test.concurrent("when there are objects or errors, they are moved to the end", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withObject(obj)
                .withText("Normal text")
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: "red" } })
                .debug();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                "Normal text %cGreen text%c %cRed text%c",
                "color:green",
                "%s",
                "color:red",
                "%s",
                obj,
                error
            );
        });
    });

    describe("scope", () => {
        test.concurrent("starting a scope always return a new instance", ({ expect }) => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = logger.startScope("foo");
            const scope2 = logger.startScope("bar");

            expect(scope1).not.toBe(scope2);
        });

        test.concurrent("a scope inherit from the root logger log level", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.error });
            const scope = logger.startScope("foo");

            scope.information("bar");
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when a scope is started, the root logger can still write logs", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const logValue = "bar";

            logger.startScope("foo");
            logger.information(logValue);

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(logValue);
        });
    });
});

describe("ConsoleLoggerScope", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof ConsoleLogger, keyof typeof console, boolean[]][])("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof ConsoleLogger, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", logLevel);
            const logValue = "bar";

            scope[loggerFunction](logValue);
            scope.end();

            const expectedResult = expectedResults[logLevel];

            if (expectedResult === undefined) {
                throw new Error(`There's no expected result for logLevel: "${logLevel}".`);
            }

            if (expectedResult) {
                expect(logMock).toHaveBeenCalledOnce();
                expect(groupCollapsedMock).toHaveBeenCalledOnce();
                expect(groupEndMock).toHaveBeenCalledOnce();
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
        ] satisfies [keyof ConsoleLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.withText("Hello").withText(" World")[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("Hello", " World");
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { name: "John", age: 30 };

            scope.withText("User:").withObject(obj)[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("User:", obj);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);
            const error = new Error("Test error");

            scope.withText("Error occurred:").withError(error)[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("Error occurred:", error);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with mixed items", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };
            const error = new Error("Test error");

            scope
                .withText("Processing item")
                .withObject(obj)
                .withText("failed with error")
                .withError(error)
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("Processing item", obj, "failed with error", error);
        });
    });

    describe("styling", () => {
        const pairs = [
            ["debug", "log"],
            ["information", "log"],
            ["warning", "warn"],
            ["error", "error"],
            ["critical", "error"]
        ] satisfies [keyof ConsoleLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.withText("Styled text", { style: { color: "red", fontWeight: "bold" } })[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        test.concurrent.for(pairs)("can handle multiple styled items with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                "%cRed text%c %cBlue text%c",
                "color:red",
                "%s",
                "color:blue",
                "%s"
            );
        });

        test.concurrent.for(pairs)("can mix styled and unstyled text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                "Normal text %cStyled text%c More normal text",
                "color:green",
                "%s"
            );
        });

        test.concurrent("when there are objects or errors, they are moved to the end", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };
            const error = new Error("Test error");

            scope
                .withObject(obj)
                .withText("Normal text")
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: "red" } })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                "Normal text %cGreen text%c %cRed text%c",
                "color:green",
                "%s",
                "color:red",
                "%s",
                obj,
                error
            );
        });
    });

    describe("end", () => {
        it.concurrent("should end scope without logs if no pending logs", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.end();

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });

        it.concurrent("should dismiss scope without logging", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const groupLog = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("This should not appear");
            scope.end({ dismiss: true });

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(groupLog).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });

        it.concurrent("should end scope with custom label style", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const groupLog = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("content");
            scope.end({ labelStyle: { color: "purple", fontWeight: "bold" } });

            expect(groupCollapsedMock).toHaveBeenCalledWith(
                "%cfoo",
                "color:purple;font-weight:bold"
            );
            expect(groupLog).toHaveBeenCalledWith("content");
            expect(groupEndMock).toHaveBeenCalled();
        });

        it.concurrent("should use initial label style if no end style provided", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const groupLog = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug, {
                labelStyle: { color: "orange" }
            });

            scope.debug("content");
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledWith(
                "%cfoo",
                "color:orange"
            );
            expect(groupLog).toHaveBeenCalledWith("content");
            expect(groupEndMock).toHaveBeenCalled();
        });

        it.concurrent("should not log again after scope has ended", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new ConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("first log");
            scope.end();

            scope.debug("after log");
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(1);
            expect(groupEndMock).toHaveBeenCalledTimes(1);
        });
    })
});


