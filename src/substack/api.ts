import { requestUrl, RequestUrlResponse } from "obsidian";
import {
  SubstackDocument,
  SubstackDraftPayload,
  SubstackDraftResponse,
} from "./types";

export class SubstackAPI {
  private cookie: string;

  constructor(cookie: string) {
    this.cookie = this.normalizeCookie(cookie);
  }

  /**
   * Normalize cookie to ensure it has the correct format
   * User can input just the value or the full cookie string
   */
  private normalizeCookie(cookie: string): string {
    const trimmed = cookie.trim();

    // Already has a cookie name prefix
    if (trimmed.includes("=")) {
      return trimmed;
    }

    // Just the value - add substack.sid prefix
    return `substack.sid=${trimmed}`;
  }

  private getBaseUrl(publication: string): string {
    return `https://${publication}.substack.com/api/v1`;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Cookie: this.cookie,
    };
  }

  async createDraft(
    publication: string,
    title: string,
    body: SubstackDocument,
    subtitle?: string,
    audience: SubstackDraftPayload["audience"] = "everyone"
  ): Promise<RequestUrlResponse> {
    // Substack API expects these fields for new drafts
    // draft_body must be a JSON string, not an object
    const payload = {
      draft_title: title,
      draft_subtitle: subtitle || "",
      draft_body: JSON.stringify(body),
      draft_bylines: [],
      audience,
      type: "newsletter",
      section_chosen: false,
      write_comment_permissions: "everyone",
    };

    const url = `${this.getBaseUrl(publication)}/drafts`;

    // Debug logging to file - log full body for analysis
    this.log("DEBUG", "Full draft_body content", {
      draft_body: body,
    });

    this.log("INFO", "Creating draft", {
      url,
      publication,
      title,
      subtitle: subtitle || "(none)",
      audience,
      cookieLength: this.cookie.length,
      cookiePrefix: this.cookie.substring(0, 40) + "...",
      payloadSize: JSON.stringify(payload).length,
      bodyBlockCount: body.content?.length || 0,
    });

    try {
      const response = await requestUrl({
        url,
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      this.log("INFO", "Draft created successfully", {
        status: response.status,
        responseKeys: Object.keys(response.json || {}),
      });

      return response;
    } catch (error) {
      const errorDetails = {
        url,
        publication,
        title,
        headers: { ...this.getHeaders(), Cookie: this.cookie.substring(0, 40) + "..." },
        payloadPreview: JSON.stringify(payload).substring(0, 500),
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
        } : String(error),
      };
      this.log("ERROR", "Failed to create draft", errorDetails);
      throw error;
    }
  }

  private log(level: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [SubstackAPI] [${level}] ${message}`;

    if (data) {
      console.log(logLine, JSON.stringify(data, null, 2)); // eslint-disable-line no-console
    } else {
      console.log(logLine); // eslint-disable-line no-console
    }

    // Also write to global log array for file persistence
    if (typeof window !== "undefined") {
      (window as unknown as { substackApiLogs?: string[] }).substackApiLogs =
        (window as unknown as { substackApiLogs?: string[] }).substackApiLogs || [];
      (window as unknown as { substackApiLogs?: string[] }).substackApiLogs!.push(
        `${logLine} ${data ? JSON.stringify(data) : ""}\n`
      );
    }
  }

  async publishDraft(
    publication: string,
    draftId: string
  ): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts/${draftId}/publish`,
      method: "POST",
      headers: this.getHeaders(),
    });

    return response;
  }

  async listDrafts(publication: string): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts`,
      method: "GET",
      headers: this.getHeaders(),
    });

    return response;
  }

  async updateDraft(
    publication: string,
    draftId: string,
    updates: Partial<SubstackDraftPayload>
  ): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts/${draftId}`,
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return response;
  }

  async getDraft(
    publication: string,
    draftId: string
  ): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts/${draftId}`,
      method: "GET",
      headers: this.getHeaders(),
    });

    return response;
  }

  updateCookie(newCookie: string): void {
    this.cookie = newCookie;
  }
}

// Re-export types for convenience
export type { SubstackDocument, SubstackDraftPayload, SubstackDraftResponse };
