import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompositeLogger, CompositeLoggerScope } from "../src/CompositeLogger.ts";
import { ConsoleLogger } from "../src/ConsoleLogger.ts";
import type { Logger, LoggerScope, LoggerScopeOptions, LogOptions } from "../src/Logger.ts";
import { LogLevel } from "../src/Logger.ts";

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleGroup = vi.fn();
const mockConsoleGroupCollapsed = vi.fn();
const mockConsoleGroupEnd = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.stubGlobal("console", {
        log: mockConsoleLog,
        warn: mockConsoleWarn,
        error: mockConsoleError,
        group: mockConsoleGroup,
        groupCollapsed: mockConsoleGroupCollapsed,
        groupEnd: mockConsoleGroupEnd
    });
});

describe("CompositeLogger", () => {
    describe("constructor", () => {
        it("should create a composite logger with empty loggers array", () => {
            const compositeLogger = new CompositeLogger();

            expect(compositeLogger.getName()).toBe("CompositeLogger");
        });

        it("should create a composite logger with provided loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);

            expect(compositeLogger.getName()).toBe("CompositeLogger");
        });
    });

    describe("getName", () => {
        it("should return 'CompositeLogger'", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1]);

            expect(compositeLogger.getName()).toBe("CompositeLogger");
        });
    });

    describe("withText", () => {
        it("should call withText on all loggers and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "red" } };

            compositeLogger.withText("test message", options).debug();

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("%ctest message%c", "color:red", "%s");
        });

        it("should return the composite logger for chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1]);

            const result = compositeLogger.withText("test");

            expect(result).toBe(compositeLogger);
        });

        it("should handle empty loggers array", () => {
            const compositeLogger = new CompositeLogger([]);

            expect(() => compositeLogger.withText("test")).not.toThrow();
        });
    });

    describe("withError", () => {
        it("should call withError on all loggers and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const error = new Error("Test error");

            compositeLogger.withError(error).debug();

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith(error);
        });

        it("should return the composite logger for chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1]);
            const error = new Error("Test error");

            const result = compositeLogger.withError(error);

            expect(result).toBe(compositeLogger);
        });
    });

    describe("withObject", () => {
        it("should call withObject on all loggers and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const obj = { name: "test", value: 42 };

            compositeLogger.withObject(obj).debug();

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith(obj);
        });

        it("should return the composite logger for chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1]);
            const obj = { test: true };

            const result = compositeLogger.withObject(obj);

            expect(result).toBe(compositeLogger);
        });
    });

    describe("debug", () => {
        it("should call debug on all loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "gray" } };

            compositeLogger.debug("debug message", options);

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("%cdebug message%c", "color:gray", "%s");
        });

        it("should call debug without parameters", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);

            compositeLogger.debug();

            // Should not log anything since no content was provided
            expect(mockConsoleLog).toHaveBeenCalledTimes(0);
        });
    });

    describe("information", () => {
        it("should call information on all loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "blue" } };

            compositeLogger.information("info message", options);

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("%cinfo message%c", "color:blue", "%s");
        });
    });

    describe("warning", () => {
        it("should call warning on all loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "orange" } };

            compositeLogger.warning("warning message", options);

            // Should log twice to each method (once for each logger)
            expect(mockConsoleWarn).toHaveBeenCalledTimes(2);
            expect(mockConsoleWarn).toHaveBeenCalledWith("%cwarning message%c", "color:orange", "%s");
        });
    });

    describe("error", () => {
        it("should call error on all loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "red" } };

            compositeLogger.error("error message", options);

            // Should log twice to each method (once for each logger)
            expect(mockConsoleError).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledWith("%cerror message%c", "color:red", "%s");
        });
    });

    describe("critical", () => {
        it("should call critical on all loggers", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { style: { color: "darkred" } };

            compositeLogger.critical("critical message", options);

            // Should log twice to each method (once for each logger)
            expect(mockConsoleError).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledWith("%ccritical message%c", "color:darkred", "%s");
        });
    });

    describe("startScope", () => {
        it("should create scopes from all loggers and return CompositeLoggerScope", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const options = { labelStyle: { color: "purple" } };

            const scope = compositeLogger.startScope("Test Scope", options);

            expect(scope).toBeInstanceOf(CompositeLoggerScope);
        });

        it("should handle empty loggers array", () => {
            const compositeLogger = new CompositeLogger([]);

            const scope = compositeLogger.startScope("Test Scope");

            expect(scope).toBeInstanceOf(CompositeLoggerScope);
        });
    });

    describe("builder pattern", () => {
        it("should support method chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const compositeLogger = new CompositeLogger([consoleLogger1, consoleLogger2]);
            const testObj = { id: 1 };
            const testError = new Error("Test error");

            compositeLogger
                .withText("Processing item")
                .withObject(testObj)
                .withError(testError)
                .withText("completed")
                .debug();

            // Should log twice (once for each logger)
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("Processing item", testObj, testError, "completed");
        });
    });
});

describe("CompositeLoggerScope", () => {
    describe("constructor", () => {
        it("should create a composite scope with empty scopes array", () => {
            const compositeScope = new CompositeLoggerScope();

            expect(compositeScope).toBeInstanceOf(CompositeLoggerScope);
        });

        it("should create a composite scope with provided scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            expect(compositeScope).toBeInstanceOf(CompositeLoggerScope);
        });
    });

    describe("withText", () => {
        it("should call withText on all scopes and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const options = { style: { color: "green" } };

            compositeScope.withText("scope message", options).debug();
            compositeScope.end();

            // Should log twice (once for each scope) with group headers
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("%cscope message%c", "color:green", "%s");
        });

        it("should return the composite scope for chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            const result = compositeScope.withText("test");

            expect(result).toBe(compositeScope);
        });
    });

    describe("withError", () => {
        it("should call withError on all scopes and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const error = new Error("Scope error");

            compositeScope.withError(error).debug();
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith(error);
        });
    });

    describe("withObject", () => {
        it("should call withObject on all scopes and log when debug is called", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const obj = { scopeData: "test" };

            compositeScope.withObject(obj).debug();
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith(obj);
        });
    });

    describe("debug", () => {
        it("should call debug on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const options = { style: { color: "gray" } };

            compositeScope.debug("debug in scope", options);
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("%cdebug in scope%c", "color:gray", "%s");
        });
    });

    describe("information", () => {
        it("should call information on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            compositeScope.information("info in scope");
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("info in scope");
        });
    });

    describe("warning", () => {
        it("should call warning on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            compositeScope.warning("warning in scope");
            compositeScope.end();

            // Should log twice to each method (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleWarn).toHaveBeenCalledTimes(2);
            expect(mockConsoleWarn).toHaveBeenCalledWith("warning in scope");
        });
    });

    describe("error", () => {
        it("should call error on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            compositeScope.error("error in scope");
            compositeScope.end();

            // Should log twice to each method (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledWith("error in scope");
        });
    });

    describe("critical", () => {
        it("should call critical on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            compositeScope.critical("critical in scope");
            compositeScope.end();

            // Should log twice to each method (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledTimes(2);
            expect(mockConsoleError).toHaveBeenCalledWith("critical in scope");
        });
    });

    describe("end", () => {
        it("should call end on all scopes", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const options = { dismiss: true };

            compositeScope.debug("test message");
            compositeScope.end(options);

            // Should not log anything when dismissed
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(0);
            expect(mockConsoleLog).toHaveBeenCalledTimes(0);
        });

        it("should call end without options", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);

            compositeScope.debug("test message");
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleGroupEnd).toHaveBeenCalledTimes(2);
        });
    });

    describe("builder pattern in scope", () => {
        it("should support method chaining", () => {
            const consoleLogger1 = new ConsoleLogger({ logLevel: LogLevel.debug });
            const consoleLogger2 = new ConsoleLogger({ logLevel: LogLevel.debug });

            const scope1 = consoleLogger1.startScope("Test Scope");
            const scope2 = consoleLogger2.startScope("Test Scope");
            const compositeScope = new CompositeLoggerScope([scope1, scope2]);
            const testObj = { scopeId: 1 };
            const testError = new Error("Scope error");

            compositeScope
                .withText("Scope processing")
                .withObject(testObj)
                .withError(testError)
                .withText("scope completed")
                .debug();
            compositeScope.end();

            // Should log twice (once for each scope)
            expect(mockConsoleGroupCollapsed).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledTimes(2);
            expect(mockConsoleLog).toHaveBeenCalledWith("Scope processing", testObj, testError, "scope completed");
        });
    });
});
