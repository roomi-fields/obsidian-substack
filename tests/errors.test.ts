import { describe, it, expect } from "vitest";

/**
 * Test the error message logic from PostComposer
 * Extracted as pure function for testability
 */
function getErrorMessage(
  status: number,
  action: string = "create draft",
): string {
  switch (status) {
    case 401:
    case 403:
      return "Session expired or invalid. Please login again in Settings.";
    case 404:
      return "Publication not found. Check your publication name in Settings.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Substack is temporarily unavailable. Please try again later.";
    default:
      return `Failed to ${action} (error ${status})`;
  }
}

describe("getErrorMessage", () => {
  describe("authentication errors", () => {
    it("should return auth error for 401 status", () => {
      const message = getErrorMessage(401);
      expect(message).toContain("Session expired");
      expect(message).toContain("login again");
    });

    it("should return auth error for 403 status", () => {
      const message = getErrorMessage(403);
      expect(message).toContain("Session expired");
    });
  });

  describe("not found errors", () => {
    it("should return not found error for 404", () => {
      const message = getErrorMessage(404);
      expect(message).toContain("Publication not found");
      expect(message).toContain("Settings");
    });
  });

  describe("rate limiting", () => {
    it("should return rate limit error for 429", () => {
      const message = getErrorMessage(429);
      expect(message).toContain("Too many requests");
      expect(message).toContain("wait");
    });
  });

  describe("server errors", () => {
    it("should return server error for 500", () => {
      const message = getErrorMessage(500);
      expect(message).toContain("temporarily unavailable");
    });

    it("should return server error for 502", () => {
      const message = getErrorMessage(502);
      expect(message).toContain("temporarily unavailable");
    });

    it("should return server error for 503", () => {
      const message = getErrorMessage(503);
      expect(message).toContain("temporarily unavailable");
    });
  });

  describe("unknown errors", () => {
    it("should return generic error for unknown status codes", () => {
      const message = getErrorMessage(418);
      expect(message).toContain("error 418");
      expect(message).toContain("create draft");
    });

    it("should include custom action in generic error", () => {
      const message = getErrorMessage(418, "publish");
      expect(message).toContain("publish");
      expect(message).toContain("error 418");
    });

    it("should handle 400 Bad Request", () => {
      const message = getErrorMessage(400);
      expect(message).toContain("error 400");
    });

    it("should handle 504 Gateway Timeout", () => {
      const message = getErrorMessage(504);
      expect(message).toContain("error 504");
    });
  });

  describe("action parameter", () => {
    it("should use default action 'create draft'", () => {
      const message = getErrorMessage(999);
      expect(message).toBe("Failed to create draft (error 999)");
    });

    it("should use custom action when provided", () => {
      const message = getErrorMessage(999, "update post");
      expect(message).toBe("Failed to update post (error 999)");
    });
  });
});
