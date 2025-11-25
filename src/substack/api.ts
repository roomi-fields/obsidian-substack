import { requestUrl, RequestUrlResponse } from "obsidian";

export interface SubstackDraft {
  id?: string;
  title: string;
  subtitle?: string;
  body: unknown; // Substack JSON body format
  audience?: "everyone" | "only_paid" | "founding" | "only_free";
}

export interface SubstackDraftResponse {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  post_date: string;
  audience: string;
  draft_title: string;
  draft_subtitle: string;
  draft_body: unknown;
}

export class SubstackAPI {
  private cookie: string;

  constructor(cookie: string) {
    this.cookie = cookie;
  }

  private getBaseUrl(publication: string): string {
    return `https://${publication}.substack.com/api/v1`;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Cookie": this.cookie,
    };
  }

  async createDraft(
    publication: string,
    title: string,
    body: unknown,
    subtitle?: string,
    audience: SubstackDraft["audience"] = "everyone"
  ): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts`,
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        title,
        subtitle: subtitle || "",
        body,
        audience,
      }),
    });

    return response;
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
    updates: Partial<SubstackDraft>
  ): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.getBaseUrl(publication)}/drafts/${draftId}`,
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return response;
  }

  updateCookie(newCookie: string): void {
    this.cookie = newCookie;
  }
}
