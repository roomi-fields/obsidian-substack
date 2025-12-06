import { WordPressWikiLink, WordPressCategoryMapping } from "./types";
import { WordPressAPI } from "./api";
import { ILogger } from "../utils/logger";

/**
 * Converts Obsidian wikilinks to WordPress internal links
 */
export class WikiLinkConverter {
  private api: WordPressAPI;
  private categoryPageIds: WordPressCategoryMapping;
  private logger: ILogger;
  private linkCache: Map<string, string>;

  constructor(
    api: WordPressAPI,
    categoryPageIds: WordPressCategoryMapping,
    logger: ILogger
  ) {
    this.api = api;
    this.categoryPageIds = categoryPageIds;
    this.logger = logger;
    this.linkCache = new Map();
  }

  /**
   * Parse wikilinks from markdown content
   * Matches: [[Link]] or [[Link|Display Text]]
   * Does NOT match image wikilinks: ![[image.png]]
   */
  parseWikiLinks(markdown: string): WordPressWikiLink[] {
    const links: WordPressWikiLink[] = [];

    // Match [[...]] but not ![[...]] (images)
    // Use negative lookbehind to exclude image wikilinks
    const wikiLinkRegex = /(?<!!)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;

    let match;
    while ((match = wikiLinkRegex.exec(markdown)) !== null) {
      const linkText = match[1]?.trim() ?? "";
      const displayText = match[2]?.trim();

      // Skip if this looks like an image reference (has extension)
      if (this.isImageFile(linkText)) {
        continue;
      }

      links.push({
        fullMatch: match[0],
        linkText,
        displayText: displayText || undefined
      });
    }

    return links;
  }

  /**
   * Check if a path looks like an image file
   */
  private isImageFile(path: string): boolean {
    const imageExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".svg",
      ".bmp"
    ];
    const lowerPath = path.toLowerCase();
    return imageExtensions.some((ext) => lowerPath.endsWith(ext));
  }

  /**
   * Find WordPress page URL for a wikilink
   * Searches across all category parent pages
   */
  async findPageUrl(linkText: string): Promise<string | null> {
    // Check cache first
    if (this.linkCache.has(linkText)) {
      return this.linkCache.get(linkText) ?? null;
    }

    this.logger.debug(`Searching for WordPress page: ${linkText}`);

    // Search in all category parent pages
    for (const [category, parentId] of Object.entries(this.categoryPageIds)) {
      const result = await this.api.findPageByTitle(linkText, parentId);

      if (result.success && result.data) {
        const url = result.data.link;
        this.logger.debug(
          `Found page "${linkText}" in category "${category}": ${url}`
        );
        this.linkCache.set(linkText, url);
        return url;
      }
    }

    // Try searching without parent restriction (global search)
    const globalResult = await this.api.findPageByTitle(linkText);
    if (globalResult.success && globalResult.data) {
      const url = globalResult.data.link;
      this.logger.debug(`Found page "${linkText}" globally: ${url}`);
      this.linkCache.set(linkText, url);
      return url;
    }

    this.logger.warn(`WordPress page not found for wikilink: ${linkText}`);
    return null;
  }

  /**
   * Convert a single wikilink to HTML anchor tag
   */
  async convertWikiLink(wikiLink: WordPressWikiLink): Promise<string> {
    const url = await this.findPageUrl(wikiLink.linkText);

    if (url) {
      const displayText = wikiLink.displayText || wikiLink.linkText;
      return `<a href="${url}">${displayText}</a>`;
    }

    // If page not found, return just the display text (or link text)
    // This allows the content to be readable even if the link is broken
    return wikiLink.displayText || wikiLink.linkText;
  }

  /**
   * Process all wikilinks in markdown content
   * Returns the markdown with wikilinks replaced by HTML links or plain text
   */
  async processWikiLinks(markdown: string): Promise<string> {
    const wikiLinks = this.parseWikiLinks(markdown);

    if (wikiLinks.length === 0) {
      return markdown;
    }

    this.logger.info(`Processing ${wikiLinks.length} wikilinks`);

    let processedMarkdown = markdown;

    for (const wikiLink of wikiLinks) {
      const replacement = await this.convertWikiLink(wikiLink);
      processedMarkdown = processedMarkdown.replace(
        wikiLink.fullMatch,
        replacement
      );
    }

    return processedMarkdown;
  }

  /**
   * Clear the link cache
   */
  clearCache(): void {
    this.linkCache.clear();
  }

  /**
   * Update category page IDs mapping
   */
  updateCategoryPageIds(categoryPageIds: WordPressCategoryMapping): void {
    this.categoryPageIds = categoryPageIds;
    this.clearCache();
  }
}
