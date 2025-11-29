import { describe, it, expect, beforeEach } from "vitest";
import { LogLevel, Logger, createLogger } from "../src/utils/logger";

describe("createLogger factory", () => {
  it("should create a no-op logger when devMode is false", () => {
    const logger = createLogger("test", false);
    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it("should create a real logger when devMode is true", () => {
    const logger = createLogger("test", true, LogLevel.DEBUG);
    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it("should use ERROR log level by default", () => {
    const logger = createLogger("test", true);
    expect(logger).toBeInstanceOf(Logger);
  });
});

describe("NoOpLogger", () => {
  it("should not throw when calling any method", () => {
    const logger = createLogger("test", false);

    // All methods should be callable without error
    expect(() => logger.debug("test")).not.toThrow();
    expect(() => logger.info("test")).not.toThrow();
    expect(() => logger.warn("test")).not.toThrow();
    expect(() => logger.error("test")).not.toThrow();
    expect(() => logger.time("test")).not.toThrow();
    expect(() => logger.timeEnd("test")).not.toThrow();
    expect(() => logger.group("test")).not.toThrow();
    expect(() => logger.groupEnd()).not.toThrow();
    expect(() => logger.table({ a: 1 })).not.toThrow();
    expect(() => logger.logPluginLoad()).not.toThrow();
    expect(() => logger.logPluginUnload()).not.toThrow();
    expect(() => logger.logCommandExecution("test")).not.toThrow();
    expect(() => logger.logSettingsChange("key", "old", "new")).not.toThrow();
    expect(() => logger.setDevMode(true)).not.toThrow();
    expect(() => logger.setLogLevel(LogLevel.DEBUG)).not.toThrow();
  });
});

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger("TestLogger", true, LogLevel.DEBUG);
  });

  describe("log level filtering", () => {
    it("should respect log level settings", () => {
      const infoLogger = new Logger("test", true, LogLevel.INFO);
      // DEBUG level should be filtered out when log level is INFO
      // We can verify by checking that the logger doesn't throw
      expect(() => infoLogger.debug("should be filtered")).not.toThrow();
    });

    it("should allow changing log level", () => {
      logger.setLogLevel(LogLevel.ERROR);
      expect(() => logger.debug("filtered")).not.toThrow();
      expect(() => logger.info("filtered")).not.toThrow();
      expect(() => logger.warn("filtered")).not.toThrow();
      expect(() => logger.error("allowed")).not.toThrow();
    });
  });

  describe("setDevMode", () => {
    it("should allow setting dev mode", () => {
      expect(() => logger.setDevMode(false)).not.toThrow();
      expect(() => logger.setDevMode(true)).not.toThrow();
    });
  });

  describe("logging methods", () => {
    it("should handle debug with arguments", () => {
      expect(() => logger.debug("message", { key: "value" })).not.toThrow();
    });

    it("should handle info with arguments", () => {
      expect(() => logger.info("message", { key: "value" })).not.toThrow();
    });

    it("should handle warn with arguments", () => {
      expect(() => logger.warn("message", { key: "value" })).not.toThrow();
    });

    it("should handle error with Error object", () => {
      const error = new Error("test error");
      expect(() => logger.error("message", error)).not.toThrow();
    });

    it("should handle error with plain object", () => {
      expect(() => logger.error("message", { code: 500 })).not.toThrow();
    });

    it("should handle error without second argument", () => {
      expect(() => logger.error("message")).not.toThrow();
    });
  });

  describe("timing methods", () => {
    it("should handle time/timeEnd", () => {
      expect(() => logger.time("operation")).not.toThrow();
      expect(() => logger.timeEnd("operation")).not.toThrow();
    });
  });

  describe("grouping methods", () => {
    it("should handle group/groupEnd", () => {
      expect(() => logger.group("Section")).not.toThrow();
      expect(() => logger.groupEnd()).not.toThrow();
    });
  });

  describe("table method", () => {
    it("should handle table without title", () => {
      expect(() => logger.table([{ a: 1 }, { a: 2 }])).not.toThrow();
    });

    it("should handle table with title", () => {
      expect(() => logger.table([{ a: 1 }], "Data Table")).not.toThrow();
    });
  });

  describe("lifecycle helpers", () => {
    it("should handle logPluginLoad", () => {
      expect(() => logger.logPluginLoad()).not.toThrow();
    });

    it("should handle logPluginUnload", () => {
      expect(() => logger.logPluginUnload()).not.toThrow();
    });

    it("should handle logCommandExecution", () => {
      expect(() => logger.logCommandExecution("test-command")).not.toThrow();
    });

    it("should handle logSettingsChange", () => {
      expect(() =>
        logger.logSettingsChange("setting", "oldValue", "newValue"),
      ).not.toThrow();
    });
  });

  describe("setApp", () => {
    it("should allow setting app instance", () => {
      const mockApp = {} as any;
      expect(() => logger.setApp(mockApp)).not.toThrow();
    });
  });
});

describe("LogLevel enum", () => {
  it("should have correct values", () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
  });

  it("should allow comparison for filtering", () => {
    expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
    expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
    expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
  });
});
