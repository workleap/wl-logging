import { afterEach, describe, test, vi } from "vitest";
import { BrowserConsoleLogger, BrowserConsoleLoggerScope } from "../src/BrowserConsoleLogger.ts";
import { LogLevel } from "../src/Logger.ts";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("BrowserConsoleLogger", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof BrowserConsoleLogger, keyof typeof console, boolean[]][]
    )("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof BrowserConsoleLogger, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel });
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
        ] satisfies [keyof BrowserConsoleLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Hello").withText(" World")[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("Hello", " World");
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { name: "John", age: 30 };

            logger.withText("User:").withObject(obj)[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("User:", obj);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const error = new Error("Test error");

            logger.withText("Error occurred:").withError(error)[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("Error occurred:", error);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
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

            expect(logMock).toHaveBeenCalledOnce();
            // The sequencing has been preserved because there's no styling.
            expect(logMock).toHaveBeenCalledWith("Processing segment", "\r\n", "on multiple lines", obj, "\r\n", "failed with error", error);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with mixed segments", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withText("Processing segment")
                .withObject(obj)
                .withText("failed with error")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            // The sequencing has been preserved because there's no styling.
            expect(logMock).toHaveBeenCalledWith("Processing segment", obj, "failed with error", error);
        });

        test.concurrent("when the text is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            logger.withText().debug();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when the object is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            logger.withObject().debug();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when the error is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            logger.withError().debug();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("can add multiple line changes", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("First line")
                .withLineChange()
                .withLineChange()
                .withLineChange()
                .withText("Last line")
                .debug();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                "First line",
                "\r\n",
                "\r\n",
                "\r\n",
                "Last line"
            );
        });

        test.concurrent("can add multiple lines with text followed by an object", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const obj3 = { id: 3 };

            logger
                .withText("First line")
                .withObject(obj1)
                .withLineChange()
                .withText("Second line")
                .withObject(obj2)
                .withLineChange()
                .withText("Third line")
                .withObject(obj3)
                .debug();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                "First line",
                obj1,
                "\r\n",
                "Second line",
                obj2,
                "\r\n",
                "Third line",
                obj3
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
        ] satisfies [keyof BrowserConsoleLogger, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Styled text", { style: { color: "red", fontWeight: "bold" } })[loggerFunction]();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        test.concurrent.for(pairs)("can handle multiple styled text segments with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                // eslint-disable-next-line no-unexpected-multiline
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

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                // eslint-disable-next-line no-unexpected-multiline
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

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
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

        test.concurrent("when there are text and an object on the first line, and there is styled text on subsequent lines, render all segment in their original order", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withObject(obj)
                .withText("Normal text")
                .withLineChange()
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: "red" } })
                .debug();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                obj,
                "Normal text",
                "\r\n",
                "Green text",
                error,
                "Red text"
            );
        });

        test.concurrent("can add a line change between two objects when they are followed by styled text", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withObject(obj)
                .withLineChange()
                .withError(error)
                .withText("Green text", { style: { color: "green" } })
                .debug();

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(
                obj,
                "\r\n",
                error,
                "Green text"
            );
        });
    });

    describe("scope", () => {
        test.concurrent("starting a scope always return a new instance", ({ expect }) => {
            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = logger.startScope("foo");
            const scope2 = logger.startScope("bar");

            expect(scope1).not.toBe(scope2);
        });

        test.concurrent("a scope inherit from the root logger log level", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.error });
            const scope = logger.startScope("foo");

            scope.information("bar");
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when a scope is started, the root logger can still write logs", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const logValue = "bar";

            logger.startScope("foo");
            logger.information(logValue);

            expect(logMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledWith(logValue);
        });
    });
});

describe("BrowserConsoleLoggerScope", () => {
    describe.each([
        ["debug", "log", [true, false, false, false, false]],
        ["information", "log", [true, true, false, false, false]],
        ["warning", "warn", [true, true, true, false, false]],
        ["error", "error", [true, true, true, true, false]],
        ["critical", "error", [true, true, true, true, true]]
    ] satisfies [keyof BrowserConsoleLogger, keyof typeof console, boolean[]][])("can write a \"%s\" log", (loggerFunction, consoleFunction, expectedResults) => {
        test.concurrent.for([
            ["debug", LogLevel.debug],
            ["information", LogLevel.information],
            ["warning", LogLevel.warning],
            ["error", LogLevel.error],
            ["critical", LogLevel.critical]
        ] satisfies [keyof BrowserConsoleLogger, LogLevel][])("when the log level is \"%s\"", ([, logLevel], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", logLevel);
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
        ] satisfies [keyof BrowserConsoleLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

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

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
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

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const error = new Error("Test error");

            scope.withText("Error occurred:").withError(error)[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("Error occurred:", error);
        });

        test.concurrent.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };
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

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            // The sequencing has been preserved because there's no styling.
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
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
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

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("Processing segment", obj, "failed with error", error);
        });

        test.concurrent("when the text is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.withText().debug();
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when the object is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.withObject().debug();
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("when the error is undefined, do not log an entry", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.withError().debug();
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.concurrent("can add multiple line changes", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("First line")
                .withLineChange()
                .withLineChange()
                .withLineChange()
                .withText("Last line")
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                "First line",
                "\r\n",
                "\r\n",
                "\r\n",
                "Last line"
            );
        });

        test.concurrent("can add multiple lines with text followed by an object", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const obj3 = { id: 3 };

            scope
                .withText("First line")
                .withObject(obj1)
                .withLineChange()
                .withText("Second line")
                .withObject(obj2)
                .withLineChange()
                .withText("Third line")
                .withObject(obj3)
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                "First line",
                obj1,
                "\r\n",
                "Second line",
                obj2,
                "\r\n",
                "Third line",
                obj3
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
        ] satisfies [keyof BrowserConsoleLoggerScope, keyof typeof console][];

        test.concurrent.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.withText("Styled text", { style: { color: "red", fontWeight: "bold" } })[loggerFunction]();
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        test.concurrent.for(pairs)("can handle multiple styled segments with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            // This code is a bit stupid, it's only to mute the console if the console function is not "log" (which
            // has been previously mocked).
            if (consoleFunction !== "log") {
                vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            }

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                // eslint-disable-next-line no-unexpected-multiline
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

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                // eslint-disable-next-line no-unexpected-multiline
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

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
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

        test.concurrent("when there are text and an object on the first line, and there is styled text on subsequent lines, render all segment in their original order", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };
            const error = new Error("Test error");

            scope
                .withObject(obj)
                .withText("Normal text")
                .withLineChange()
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: "red" } })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                obj,
                "Normal text",
                "\r\n",
                "Green text",
                error,
                "Red text"
            );
        });

        test.concurrent("can add a line change between two objects when they are followed by styled text", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };
            const error = new Error("Test error");

            scope
                .withObject(obj)
                .withLineChange()
                .withError(error)
                .withText("Green text", { style: { color: "green" } })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledOnce();
            expect(groupEndMock).toHaveBeenCalledOnce();

            expect(logMock).toHaveBeenCalledWith(
                obj,
                "\r\n",
                error,
                "Green text"
            );
        });
    });

    describe("end", () => {
        test.concurrent("can end scope without logs if no pending logs", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.end();

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });

        test.concurrent("can dismiss scope without logging", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("This should not appear");
            scope.end({ dismiss: true });

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(logMock).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });

        test.concurrent("can end scope with custom label style", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("content");
            scope.end({ labelStyle: { color: "purple", fontWeight: "bold" } });

            expect(groupCollapsedMock).toHaveBeenCalledWith(
                "%cfoo",
                "color:purple;font-weight:bold"
            );
            expect(logMock).toHaveBeenCalledWith("content");
            expect(groupEndMock).toHaveBeenCalled();
        });

        test.concurrent("can use initial label style if no end style provided", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug, {
                labelStyle: { color: "orange" }
            });

            scope.debug("content");
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledWith(
                "%cfoo",
                "color:orange"
            );
            expect(logMock).toHaveBeenCalledWith("content");
            expect(groupEndMock).toHaveBeenCalled();
        });

        test.concurrent("can not log again after scope has ended", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.debug("first log");
            scope.end();

            scope.debug("after log");
            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledTimes(1);
            expect(groupEndMock).toHaveBeenCalledTimes(1);
        });
    });
});


