import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";
import { ConsoleLogger, ConsoleLoggerScope } from "../src/ConsoleLogger.ts";
import { LogLevel } from "../src/Logger.ts";

const mockConsoleLog = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleGroup = vi.fn();
const mockConsoleGroupCollapsed = vi.fn();
const mockConsoleGroupEnd = vi.fn();

beforeEach(() => {
    vi.stubGlobal("console", {
        log: mockConsoleLog,
        warn: mockConsoleWarn,
        error: mockConsoleError,
        group: mockConsoleGroup,
        groupCollapsed: mockConsoleGroupCollapsed,
        groupEnd: mockConsoleGroupEnd
    });
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("ConsoleLogger", () => {
    describe("debug logging", () => {
        it("should log debug message when log level is debug", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger.debug("debug message");

            expect(mockConsoleLog).toHaveBeenCalledWith("debug message");
        });

        it("should not log debug message when log level is higher than debug", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.information });

            logger.debug("debug message");

            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    describe("information logging", () => {
        it("should log information message when log level is information or lower", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.information });

            logger.information("info message");

            expect(mockConsoleLog).toHaveBeenCalledWith("info message");
        });

        it("should not log information message when log level is higher than information", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.warning });

            logger.information("info message");

            expect(mockConsoleLog).not.toHaveBeenCalled();
        });
    });

    describe("warning logging", () => {
        it("should log warning message when log level is warning or lower", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.warning });

            logger.warning("warning message");

            expect(mockConsoleWarn).toHaveBeenCalledWith("warning message");
        });

        it("should not log warning message when log level is higher than warning", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.error });

            logger.warning("warning message");

            expect(mockConsoleWarn).not.toHaveBeenCalled();
        });
    });

    describe("error logging", () => {
        it("should log error message when log level is error or lower", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.error });

            logger.error("error message");

            expect(mockConsoleError).toHaveBeenCalledWith("error message");
        });

        it("should not log error message when log level is higher than error", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.critical });

            logger.error("error message");

            expect(mockConsoleError).not.toHaveBeenCalled();
        });
    });

    describe("critical logging", () => {
        it("should log critical message", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.critical });

            logger.critical("critical message");

            expect(mockConsoleError).toHaveBeenCalledWith("critical message");
        });
    });

    describe("builder pattern", () => {
        it("should build log with text", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Hello").withText(" World").debug();

            expect(mockConsoleLog).toHaveBeenCalledWith("Hello", " World");
        });

        it("should build log with object", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const testObj = { name: "John", age: 30 };

            logger.withText("User:").withObject(testObj).debug();

            expect(mockConsoleLog).toHaveBeenCalledWith("User:", testObj);
        });

        it("should build log with error", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const testError = new Error("Test error");

            logger.withText("Error occurred:").withError(testError).debug();

            expect(mockConsoleLog).toHaveBeenCalledWith("Error occurred:", testError);
        });

        it("should build log with mixed items", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });
            const testObj = { id: 1 };
            const testError = new Error("Test error");

            logger
                .withText("Processing item")
                .withObject(testObj)
                .withText("failed with error")
                .withError(testError)
                .debug();

            expect(mockConsoleLog).toHaveBeenCalledWith("Processing item", testObj, "failed with error", testError);
        });
    });

    describe("styling", () => {
        it("should apply CSS styling to text", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger.withText("Styled text", { style: { color: "red", fontWeight: "bold" } }).debug();

            expect(mockConsoleLog).toHaveBeenCalledWith("%cStyled text%c", "color:red;font-weight:bold", "%s");
        });

        it("should handle multiple styled text items", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Red text", { style: { color: "red" } })
                .withText("Blue text", { style: { color: "blue" } })
                .debug();

            expect(mockConsoleLog).toHaveBeenCalledWith(
                "%cRed text%c %cBlue text%c",
                "color:red",
                "%s",
                "color:blue",
                "%s"
            );
        });

        it("should mix styled and unstyled text", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            logger
                .withText("Normal text")
                .withText("Styled text", { style: { color: "green" } })
                .withText("More normal text")
                .debug();

            expect(mockConsoleLog).toHaveBeenCalledWith(
                "Normal text %cStyled text%c More normal text",
                "color:green",
                "%s"
            );
        });
    });

    describe("scope management", () => {
        it("should always create a new scope", () => {
            const logger = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = logger.startScope("Test Scope 1");
            const scope2 = logger.startScope("Test Scope 2");

            expect(scope1).not.equal(scope2);
        });
    });
});

describe("ConsoleLoggerScope", () => {
    describe("logging within scope", () => {
        it("should log debug message in scope", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.debug("debug in scope");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("debug in scope");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should log warning message in scope with duplication", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.warning("warning in scope");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("warning in scope");
            expect(mockConsoleWarn).toHaveBeenCalledWith("warning in scope");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should log error message in scope with duplication", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.error("error in scope");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("error in scope");
            expect(mockConsoleError).toHaveBeenCalledWith("error in scope");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should log critical message in scope with duplication", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.critical("critical in scope");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("critical in scope");
            expect(mockConsoleError).toHaveBeenCalledWith("critical in scope");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });
    });

    describe("builder pattern in scope", () => {
        it("should build log with text in scope", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.withText("Hello").withText(" from scope").debug();
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("Hello", " from scope");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should build log with mixed items in scope", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);
            const testObj = { id: 1 };
            const testError = new Error("Scope error");

            scope
                .withText("Scope processing")
                .withObject(testObj)
                .withError(testError)
                .debug();

            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Test Scope");
            expect(mockConsoleLog).toHaveBeenCalledWith("Scope processing", testObj, testError);
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });
    });

    describe("scope ending", () => {
        it("should end scope without logs if no pending logs", () => {
            const scope = new ConsoleLoggerScope("Empty Scope", LogLevel.debug);

            scope.end();

            expect(mockConsoleGroupCollapsed).not.toHaveBeenCalled();
            expect(mockConsoleGroupEnd).not.toHaveBeenCalled();
        });

        it("should dismiss scope without logging", () => {
            const scope = new ConsoleLoggerScope("Dismissed Scope", LogLevel.debug);

            scope.debug("This should not appear");
            scope.end({ dismiss: true });

            expect(mockConsoleGroupCollapsed).not.toHaveBeenCalled();
            expect(mockConsoleLog).not.toHaveBeenCalled();
            expect(mockConsoleGroupEnd).not.toHaveBeenCalled();
        });

        it("should end scope with custom label style", () => {
            const scope = new ConsoleLoggerScope("Styled Scope", LogLevel.debug);

            scope.debug("content");
            scope.end({ labelStyle: { color: "purple", fontWeight: "bold" } });

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith(
                "%cStyled Scope",
                "color:purple;font-weight:bold"
            );
            expect(mockConsoleLog).toHaveBeenCalledWith("content");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should use initial label style if no end style provided", () => {
            const scope = new ConsoleLoggerScope("Initial Styled Scope", LogLevel.debug, {
                labelStyle: { color: "orange" }
            });

            scope.debug("content");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith(
                "%cInitial Styled Scope",
                "color:orange"
            );
            expect(mockConsoleLog).toHaveBeenCalledWith("content");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });

        it("should not log again after scope has ended", () => {
            const scope = new ConsoleLoggerScope("Test Scope", LogLevel.debug);

            scope.debug("first log");
            scope.end();

            scope.debug("after log");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(1);
            expect(mockConsoleGroupEnd).toHaveBeenCalledTimes(1);
        });
    });

    describe("log level filtering in scope", () => {
        it("should not log when log level is too high", () => {
            const scope = new ConsoleLoggerScope("Filtered Scope", LogLevel.error);

            scope.debug("debug message");
            scope.information("info message");
            scope.warning("warning message");
            scope.end();

            expect(mockConsoleGroupCollapsed).not.toHaveBeenCalled();
            expect(mockConsoleLog).not.toHaveBeenCalled();
            expect(mockConsoleGroupEnd).not.toHaveBeenCalled();
        });

        it("should log when log level is appropriate", () => {
            const scope = new ConsoleLoggerScope("Filtered Scope", LogLevel.warning);

            scope.warning("warning message");
            scope.error("error message");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Filtered Scope");
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleWarn).toHaveBeenCalledWith("warning message");
            expect(mockConsoleError).toHaveBeenCalledWith("error message");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });
    });

    describe("multiple logs in scope", () => {
        it("should handle multiple log calls in a scope", () => {
            const scope = new ConsoleLoggerScope("Multi Log Scope", LogLevel.debug);

            scope.debug("first debug");
            scope.information("first info");
            scope.warning("first warning");
            scope.end();

            expect(mockConsoleGroupCollapsed).toHaveBeenCalledWith("Multi Log Scope");
            expect(mockConsoleLog).toHaveBeenCalledTimes(3); // All logs + duplicates for warn
            expect(mockConsoleWarn).toHaveBeenCalledWith("first warning");
            expect(mockConsoleGroupEnd).toHaveBeenCalled();
        });
    });
});
