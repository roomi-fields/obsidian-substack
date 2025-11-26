import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubstackAPI } from "../src/substack/api";

// Mock obsidian module
vi.mock("obsidian", () => ({
  requestUrl: vi.fn()
}));

import { requestUrl } from "obsidian";

// Helper to create mock response matching RequestUrlResponse interface
function mockResponse(status: number, json: unknown = {}) {
  return {
    status,
    json,
    headers: {},
    arrayBuffer: new ArrayBuffer(0),
    text: JSON.stringify(json)
  };
}

describe("SubstackAPI", () => {
  let api: SubstackAPI;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeCookie", () => {
    it("should add substack.sid= prefix when only value is provided", () => {
      api = new SubstackAPI("abc123456789");
      // Access private method via any
      const normalized = (api as any).cookie;
      expect(normalized).toBe("substack.sid=abc123456789");
    });

    it("should keep cookie as-is when already prefixed with substack.sid", () => {
      api = new SubstackAPI("substack.sid=abc123456789");
      const normalized = (api as any).cookie;
      expect(normalized).toBe("substack.sid=abc123456789");
    });

    it("should keep cookie as-is when it contains any equals sign", () => {
      api = new SubstackAPI("other.cookie=value123");
      const normalized = (api as any).cookie;
      expect(normalized).toBe("other.cookie=value123");
    });

    it("should trim whitespace from cookie input", () => {
      api = new SubstackAPI("  abc123456789  ");
      const normalized = (api as any).cookie;
      expect(normalized).toBe("substack.sid=abc123456789");
    });

    it("should handle multiple cookies in string", () => {
      api = new SubstackAPI("substack.sid=abc123; connect.sid=xyz789");
      const normalized = (api as any).cookie;
      expect(normalized).toBe("substack.sid=abc123; connect.sid=xyz789");
    });
  });

  describe("getBaseUrl", () => {
    it("should construct correct URL for publication", () => {
      api = new SubstackAPI("test-cookie");
      const url = (api as any).getBaseUrl("mypub");
      expect(url).toBe("https://mypub.substack.com/api/v1");
    });

    it("should handle publication names with hyphens", () => {
      api = new SubstackAPI("test-cookie");
      const url = (api as any).getBaseUrl("my-publication");
      expect(url).toBe("https://my-publication.substack.com/api/v1");
    });
  });

  describe("getHeaders", () => {
    it("should return correct headers with cookie", () => {
      api = new SubstackAPI("substack.sid=test123");
      const headers = (api as any).getHeaders();
      expect(headers).toEqual({
        "Content-Type": "application/json",
        Cookie: "substack.sid=test123"
      });
    });
  });

  describe("createDraft", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should construct correct payload with all required fields", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(201, { id: "draft-123" }));

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Test Title", body);

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://mypub.substack.com/api/v1/drafts",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "substack.sid=test123"
          }
        })
      );

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.draft_title).toBe("Test Title");
      expect(payload.draft_body).toBeDefined();
      expect(payload.type).toBe("newsletter");
      expect(payload.audience).toBe("everyone");
    });

    it("should handle optional subtitle correctly", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(201, { id: "draft-123" }));

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body, "My Subtitle");

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.draft_subtitle).toBe("My Subtitle");
    });

    it("should use empty string for undefined subtitle", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(201, { id: "draft-123" }));

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body);

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.draft_subtitle).toBe("");
    });

    it("should set throw: false for error handling", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(201, { id: "draft-123" }));

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body);

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          throw: false
        })
      );
    });
  });

  describe("publishDraft", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should call correct publish endpoint", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200));

      await api.publishDraft("mypub", "draft-123");

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://mypub.substack.com/api/v1/drafts/draft-123/publish",
          method: "POST"
        })
      );
    });
  });

  describe("updateCookie", () => {
    it("should update the stored cookie", () => {
      api = new SubstackAPI("old-cookie");
      api.updateCookie("substack.sid=new-cookie");

      const cookie = (api as any).cookie;
      expect(cookie).toBe("substack.sid=new-cookie");
    });

    it("should normalize the new cookie", () => {
      api = new SubstackAPI("old-cookie");
      api.updateCookie("new-value-only");

      const cookie = (api as any).cookie;
      expect(cookie).toBe("substack.sid=new-value-only");
    });
  });
});
