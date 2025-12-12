// Cannot use concurrent tests when mocking the global "console" object.

import { afterEach, describe, test, vi } from "vitest";
import { BrowserConsoleLogger, BrowserConsoleLoggerScope } from "../src/BrowserConsoleLogger.ts";
import { LogLevel } from "../src/Logger.ts";

afterEach(() => {
    vi.clearAllMocks();
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
        test.for([
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
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(logMock).toHaveBeenCalledExactlyOnceWith(logValue);
            } else {
                // eslint-disable-next-line vitest/no-conditional-expect
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

        test.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Hello")
                .withText("World")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("Hello World");
        });

        test.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { name: "John", age: 30 };

            logger
                .withText("User:")
                .withObject(obj)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("User:", obj);
        });

        test.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const error = new Error("Test error");

            logger
                .withText("Error occurred:")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("Error occurred:", error);
        });

        test.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
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

            expect(logMock).toHaveBeenCalledExactlyOnceWith("Processing segment", "\r\n", "on multiple lines", obj, "\r\n", "failed with error", error);
        });

        test.for(pairs)("can build a \"%s\" log with mixed segments", ([loggerFunction, consoleFunction], { expect }) => {
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

            expect(logMock).toHaveBeenCalledExactlyOnceWith("Processing segment", obj, "failed with error", error);
        });

        test.for(pairs)("when the text is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.for(pairs)("when the object is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withObject()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.for(pairs)("when the error is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withError()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).not.toHaveBeenCalled();
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

        test.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Styled text", { style: { color: "red", fontWeight: "bold" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        test.for(pairs)("can handle multiple styled text segments with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cRed text%c %cBlue text%c", "color:red", "%s", "color:blue", "%s");
        });

        test.for(pairs)("can mix styled and unstyled text segments with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("Normal text %cStyled text%c More normal text", "color:green", "%s");
        });

        test.for(pairs)("can mix styled text segments and objects with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };
            const error = new Error("Test error");

            logger
                .withText("Green text", { style: { color: "green" } })
                .withObject(obj)
                .withError(error)
                .withText("More text")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", obj, error, "More text");
        });

        test.for(pairs)("when there is a styled text segments after an object, the text segment is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };

            logger
                .withText("Green text", { style: { color: "green" } })
                .withObject(obj)
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", obj, "Red text");
        });

        test.for(pairs)("when there is styled text after an error, the text is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const error = new Error("Test error");

            logger
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", error, "Red text");
        });

        test.for(pairs)("when there is styled text after a line change, the text is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Green text", { style: { color: "green" } })
                .withLineChange()
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", "\r\n", "Red text");
        });
    });

    describe("scope", () => {
        test("starting a scope always return a new instance", ({ expect }) => {
            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = logger.startScope("foo");
            const scope2 = logger.startScope("bar");

            expect(scope1).not.toBe(scope2);
        });

        test("a scope inherit from the root logger log level", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.error });
            const scope = logger.startScope("foo");

            scope.information("bar");
            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test("when a scope is started, the root logger can still write logs", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const logValue = "bar";

            logger.startScope("foo");
            logger.information(logValue);

            expect(logMock).toHaveBeenCalledExactlyOnceWith(logValue);
        });
    });

    describe("line change", () => {
        test("can add a single line change", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("First line")
                .withLineChange()
                .withText("Second line")
                .debug();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", "\r\n", "Second line");
        });

        test("can add multiple line changes", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("First line")
                .withLineChange()
                .withLineChange()
                .withLineChange()
                .withText("Last line")
                .debug();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", "\r\n", "\r\n", "\r\n", "Last line");
        });

        test("can add multiple lines with text followed by an object", ({ expect }) => {
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

            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", obj1, "\r\n", "Second line", obj2, "\r\n", "Third line", obj3);
        });
    });

    describe("leading space", () => {
        test("can remove the leading space for 2 unstyled text segments", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("First")
                .withText("Second", { leadingSpace: false })
                .debug();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("FirstSecond");
        });

        test("can remove leading space for a styled text segment followed by an unstyled text segment", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Green text", { style: { color: "green" } })
                .withText("Second", { leadingSpace: false })
                .debug();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%cSecond", "color:green", "%s");
        });

        test("can remove the leading space from multiple mixed text segments", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});

            const logger = new BrowserConsoleLogger({ logLevel: LogLevel.debug });
            const obj = { id: 1 };

            logger
                .withText("Green text", { style: { color: "green" } })
                .withText("Unstyled 1", { leadingSpace: false })
                .withText("Red text", { style: { color: "red" }, leadingSpace: false })
                .withText("Purple text", { style: { color: "purple" }, leadingSpace: false })
                .withText("Unstyled 2", { leadingSpace: false })
                .withObject(obj)
                .withText("Unstyled 3", { leadingSpace: false })
                .withText("Unstyled 4", { leadingSpace: false })
                .withLineChange()
                .withText("Orange text", { style: { color: "orange" }, leadingSpace: false })
                .withText("Unstyled 5", { leadingSpace: false })
                .debug();

            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%cUnstyled 1%cRed text%c%cPurple text%cUnstyled 2", "color:green", "%s", "color:red", "%s", "color:purple", "%s", obj, "Unstyled 3Unstyled 4", "\r\n", "Orange textUnstyled 5");
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
        test.for([
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
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(logMock).toHaveBeenCalledOnce();
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(groupCollapsedMock).toHaveBeenCalledOnce();
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(groupEndMock).toHaveBeenCalledOnce();
            } else {
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(logMock).not.toHaveBeenCalled();
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(groupCollapsedMock).not.toHaveBeenCalled();
                // eslint-disable-next-line vitest/no-conditional-expect
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

        test.for(pairs)("can build a \"%s\" log with text", ([loggerFunction, consoleFunction], { expect }) => {
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
                .withText("Hello")
                .withText("World")
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("Hello World");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can build a \"%s\" log with object", ([loggerFunction, consoleFunction], { expect }) => {
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

            scope
                .withText("User:")
                .withObject(obj)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("User:", obj);
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can build a \"%s\" log with error", ([loggerFunction, consoleFunction], { expect }) => {
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

            scope
                .withText("Error occurred:")
                .withError(error)
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("Error occurred:", error);
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can build a \"%s\" log with line changes", ([loggerFunction, consoleFunction], { expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("Processing segment", "\r\n", "on multiple lines", obj, "\r\n", "failed with error", error);
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can build a \"%s\" log with mixed segments", ([loggerFunction, consoleFunction], { expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("Processing segment", obj, "failed with error", error);
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("when the text is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.for(pairs)("when the object is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withObject()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(logMock).not.toHaveBeenCalled();
        });

        test.for(pairs)("when the error is undefined, do not log a %s entry", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withError()
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(logMock).not.toHaveBeenCalled();
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

        test.for(pairs)("can apply styling to text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
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
                .withText("Styled text", { style: { color: "red", fontWeight: "bold" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can handle multiple styled segments with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cRed text%c %cBlue text%c", "color:red", "%s", "color:blue", "%s");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("can mix styled and unstyled text with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("Normal text %cStyled text%c More normal text", "color:green", "%s");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("when there is a styled text segments after an object, the text segment is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };

            scope
                .withText("Green text", { style: { color: "green" } })
                .withObject(obj)
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", obj, "Red text");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("when there is styled text after an error, the text is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const error = new Error("Test error");

            scope
                .withText("Green text", { style: { color: "green" } })
                .withError(error)
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", error, "Red text");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test.for(pairs)("when there is styled text after a line change, the text is not styled with a \"%s\" log", ([loggerFunction, consoleFunction], { expect }) => {
            const logMock = vi.spyOn(console, consoleFunction).mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Green text", { style: { color: "green" } })
                .withLineChange()
                .withText("Red text", { style: { color: " red" } })
                // eslint-disable-next-line no-unexpected-multiline
                [loggerFunction]();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%c", "color:green", "%s", "\r\n", "Red text");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });
    });

    describe("end", () => {
        test("can end scope without logs if no pending logs", ({ expect }) => {
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope.end();

            expect(groupCollapsedMock).not.toHaveBeenCalled();
            expect(groupEndMock).not.toHaveBeenCalled();
        });

        test("can dismiss scope without logging", ({ expect }) => {
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

        test("can end scope with custom label style", ({ expect }) => {
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

        test("can use initial label style if no end style provided", ({ expect }) => {
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

        test("cannot log again after scope has ended", ({ expect }) => {
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

    describe("line change", () => {
        test("can add a single line change", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("First line")
                .withLineChange()
                .withText("Second line")
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", "\r\n", "Second line");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test("can add multiple line changes", ({ expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", "\r\n", "\r\n", "\r\n", "Last line");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test("can add multiple lines with text followed by an object", ({ expect }) => {
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
            expect(logMock).toHaveBeenCalledExactlyOnceWith("First line", obj1, "\r\n", "Second line", obj2, "\r\n", "Third line", obj3);
            expect(groupEndMock).toHaveBeenCalledOnce();
        });
    });

    describe("leading space", () => {
        test("can remove the leading space for 2 unstyled text segments", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("First")
                .withText("Second", { leadingSpace: false })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("FirstSecond");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test("can remove leading space for a styled text segment followed by an unstyled text segment", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);

            scope
                .withText("Green text", { style: { color: "green" } })
                .withText("Second", { leadingSpace: false })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%cSecond", "color:green", "%s");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });

        test("can remove the leading space from multiple mixed text segments", ({ expect }) => {
            const logMock = vi.spyOn(console, "log").mockImplementation(() => {});
            const groupCollapsedMock = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
            const groupEndMock = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

            const scope = new BrowserConsoleLoggerScope("foo", LogLevel.debug);
            const obj = { id: 1 };

            scope
                .withText("Green text", { style: { color: "green" } })
                .withText("Unstyled 1", { leadingSpace: false })
                .withText("Red text", { style: { color: "red" }, leadingSpace: false })
                .withText("Purple text", { style: { color: "purple" }, leadingSpace: false })
                .withText("Unstyled 2", { leadingSpace: false })
                .withObject(obj)
                .withText("Unstyled 3", { leadingSpace: false })
                .withText("Unstyled 4", { leadingSpace: false })
                .withLineChange()
                .withText("Orange text", { style: { color: "orange" }, leadingSpace: false })
                .withText("Unstyled 5", { leadingSpace: false })
                .debug();

            scope.end();

            expect(groupCollapsedMock).toHaveBeenCalledOnce();
            expect(logMock).toHaveBeenCalledExactlyOnceWith("%cGreen text%cUnstyled 1%cRed text%c%cPurple text%cUnstyled 2", "color:green", "%s", "color:red", "%s", "color:purple", "%s", obj, "Unstyled 3Unstyled 4", "\r\n", "Orange textUnstyled 5");
            expect(groupEndMock).toHaveBeenCalledOnce();
        });
    });
});

