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
      // Access private property for testing
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
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

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
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body, "My Subtitle");

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.draft_subtitle).toBe("My Subtitle");
    });

    it("should use empty string for undefined subtitle", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body);

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.draft_subtitle).toBe("");
    });

    it("should set throw: false for error handling", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

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

  describe("listDrafts", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should call correct list drafts endpoint", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(200, [{ id: "draft-1" }, { id: "draft-2" }])
      );

      await api.listDrafts("mypub");

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://mypub.substack.com/api/v1/drafts",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: "substack.sid=test123"
          },
          throw: false
        })
      );
    });

    it("should return response with drafts list", async () => {
      const drafts = [{ id: "draft-1" }, { id: "draft-2" }];
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200, drafts));

      const response = await api.listDrafts("mypub");

      expect(response.status).toBe(200);
      expect(response.json).toEqual(drafts);
    });
  });

  describe("updateDraft", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should call correct update endpoint with PUT method", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200));

      await api.updateDraft("mypub", "draft-123", { title: "Updated Title" });

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://mypub.substack.com/api/v1/drafts/draft-123",
          method: "PUT",
          throw: false
        })
      );
    });

    it("should send updates in request body", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200));

      const updates = { title: "New Title", subtitle: "New Subtitle" };
      await api.updateDraft("mypub", "draft-123", updates);

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload).toEqual(updates);
    });

    it("should handle partial updates", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200));

      await api.updateDraft("mypub", "draft-123", { title: "Only Title" });

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload).toEqual({ title: "Only Title" });
      expect(payload.subtitle).toBeUndefined();
    });
  });

  describe("getDraft", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should call correct get draft endpoint", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(200, { id: "draft-123", title: "My Draft" })
      );

      await api.getDraft("mypub", "draft-123");

      expect(requestUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://mypub.substack.com/api/v1/drafts/draft-123",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: "substack.sid=test123"
          },
          throw: false
        })
      );
    });

    it("should return draft data in response", async () => {
      const draftData = {
        id: "draft-123",
        title: "My Draft",
        subtitle: "A subtitle",
        body: { type: "doc", content: [] }
      };
      vi.mocked(requestUrl).mockResolvedValueOnce(mockResponse(200, draftData));

      const response = await api.getDraft("mypub", "draft-123");

      expect(response.status).toBe(200);
      expect(response.json).toEqual(draftData);
    });

    it("should handle 404 for non-existent draft", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(404, { error: "Not found" })
      );

      const response = await api.getDraft("mypub", "nonexistent");

      expect(response.status).toBe(404);
    });
  });

  describe("createDraft with different audiences", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should support only_paid audience", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body, undefined, "only_paid");

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.audience).toBe("only_paid");
    });

    it("should support founding audience", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body, undefined, "founding");

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.audience).toBe("founding");
    });

    it("should support only_free audience", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(201, { id: "draft-123" })
      );

      const body = { type: "doc" as const, content: [] };
      await api.createDraft("mypub", "Title", body, undefined, "only_free");

      const call = vi.mocked(requestUrl).mock.calls[0];
      const callArg = call?.[0] as { body?: string };
      const payload = JSON.parse(callArg.body || "{}");

      expect(payload.audience).toBe("only_free");
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      api = new SubstackAPI("substack.sid=test123");
    });

    it("should return 401 response for invalid cookie", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(401, { error: "Unauthorized" })
      );

      const response = await api.listDrafts("mypub");

      expect(response.status).toBe(401);
    });

    it("should return 403 response for forbidden access", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(403, { error: "Forbidden" })
      );

      const response = await api.listDrafts("mypub");

      expect(response.status).toBe(403);
    });

    it("should return 500 response for server error", async () => {
      vi.mocked(requestUrl).mockResolvedValueOnce(
        mockResponse(500, { error: "Internal Server Error" })
      );

      const body = { type: "doc" as const, content: [] };
      const response = await api.createDraft("mypub", "Title", body);

      expect(response.status).toBe(500);
    });
  });
});
