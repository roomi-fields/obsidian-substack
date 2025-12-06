import { App, Modal, Notice, TFile } from "obsidian";
import { WordPressAPI } from "./api";
import { WikiLinkConverter } from "./wikiLinkConverter";
import { WordPressImageHandler } from "./imageHandler";
import { ILogger } from "../utils/logger";
import {
  WordPressFrontmatter,
  WordPressCategoryMapping,
  WordPressPostStatus,
  WordPressEnluminureInfo,
  RankMathMeta,
  WordPressServer
} from "./types";

export interface WordPressPostComposerOptions {
  servers: WordPressServer[];
  defaultServerId: string;
}

export class WordPressPostComposer extends Modal {
  private api: WordPressAPI;
  private logger: ILogger;
  private wikiLinkConverter: WikiLinkConverter;
  private imageHandler: WordPressImageHandler;
  private title: string = "";
  private category: string = "";
  private categories: string[];
  private categoryPageIds: WordPressCategoryMapping;
  private publishButton: HTMLButtonElement | null = null;
  private draftButton: HTMLButtonElement | null = null;
  private activeFile: TFile | null = null;
  private frontmatter: WordPressFrontmatter = {};
  private servers: WordPressServer[];
  private currentServer: WordPressServer;
  private categorySelectEl: HTMLSelectElement | null = null;

  constructor(
    app: App,
    logger: ILogger,
    options: WordPressPostComposerOptions
  ) {
    super(app);
    this.logger = logger;
    this.servers = options.servers;

    // Find default server or use first one
    const selectedServer = this.servers.find(s => s.id === options.defaultServerId)
      ?? this.servers[0];
    if (!selectedServer) {
      throw new Error("No WordPress servers configured");
    }
    this.currentServer = selectedServer;

    this.categoryPageIds = this.currentServer.categoryPageIds;
    this.categories = Object.keys(this.categoryPageIds);
    this.category = this.currentServer.defaultCategory || this.categories[0] || "";

    this.api = new WordPressAPI(
      this.currentServer.baseUrl,
      this.currentServer.username,
      this.currentServer.password
    );

    this.wikiLinkConverter = new WikiLinkConverter(
      this.api,
      this.categoryPageIds,
      logger
    );
    this.imageHandler = new WordPressImageHandler(this.api, app.vault, logger);
  }

  private switchServer(server: WordPressServer): void {
    this.currentServer = server;
    this.categoryPageIds = server.categoryPageIds;
    this.categories = Object.keys(this.categoryPageIds);
    this.category = server.defaultCategory || this.categories[0] || "";

    this.api = new WordPressAPI(
      server.baseUrl,
      server.username,
      server.password
    );

    this.wikiLinkConverter = new WikiLinkConverter(
      this.api,
      this.categoryPageIds,
      this.logger
    );
    this.imageHandler = new WordPressImageHandler(this.api, this.app.vault, this.logger);

    // Update category dropdown
    if (this.categorySelectEl) {
      this.categorySelectEl.empty();
      for (const cat of this.categories) {
        const option = this.categorySelectEl.createEl("option", {
          text: cat,
          value: cat
        });
        if (cat === this.category) {
          option.selected = true;
        }
      }
    }
  }

  override onOpen() {
    const { contentEl } = this;

    // Get active file and read frontmatter
    this.activeFile = this.app.workspace.getActiveFile();
    this.loadFrontmatter();

    // Title
    contentEl.createEl("h2", { text: "Publish to WordPress" });

    // Server selector (if multiple servers)
    if (this.servers.length > 1) {
      const serverContainer = contentEl.createDiv({
        cls: "wordpress-field-container"
      });

      serverContainer.createEl("label", { text: "Server" });

      const serverSelect = serverContainer.createEl("select", {
        cls: "wordpress-select"
      });

      for (const server of this.servers) {
        const option = serverSelect.createEl("option", {
          text: server.name,
          value: server.id
        });
        if (server.id === this.currentServer.id) {
          option.selected = true;
        }
      }

      serverSelect.addEventListener("change", () => {
        const selectedServer = this.servers.find(s => s.id === serverSelect.value);
        if (selectedServer) {
          this.switchServer(selectedServer);
        }
      });
    }

    // Category selector
    if (this.categories.length > 0) {
      const categoryContainer = contentEl.createDiv({
        cls: "wordpress-field-container"
      });

      categoryContainer.createEl("label", { text: "Category" });

      const categorySelect = categoryContainer.createEl("select", {
        cls: "wordpress-select"
      });
      this.categorySelectEl = categorySelect;

      // Apply frontmatter category if valid, otherwise use default
      // Support case-insensitive matching for better UX
      let matchedCategory: string | undefined;
      if (this.frontmatter.category) {
        const frontmatterCategoryLower = this.frontmatter.category.toLowerCase();
        matchedCategory = this.categories.find(
          cat => cat.toLowerCase() === frontmatterCategoryLower
        );
      }

      this.logger.debug("Category selection logic", {
        frontmatterCategory: this.frontmatter.category,
        matchedCategory,
        defaultCategory: this.category,
        availableCategories: this.categories,
        isValidCategory: !!matchedCategory
      });

      const effectiveCategory = matchedCategory || this.category;
      this.category = effectiveCategory;

      if (this.frontmatter.category && !matchedCategory) {
        this.logger.warn("Frontmatter category not found in configured categories", {
          frontmatterCategory: this.frontmatter.category,
          availableCategories: this.categories,
          fallbackToDefault: this.category
        });
      }

      this.logger.debug("Selected category", { effectiveCategory });

      for (const cat of this.categories) {
        const option = categorySelect.createEl("option", {
          text: cat,
          value: cat
        });
        if (cat === effectiveCategory) {
          option.selected = true;
        }
      }

      categorySelect.addEventListener("change", () => {
        this.category = categorySelect.value;
      });
    }

    // Title input
    const titleContainer = contentEl.createDiv({
      cls: "wordpress-field-container"
    });
    titleContainer.createEl("label", { text: "Title" });
    const titleInput = titleContainer.createEl("input", {
      type: "text",
      placeholder: "Article title",
      cls: "wordpress-input"
    });

    // Pre-fill with frontmatter or file name
    if (this.frontmatter.title) {
      this.title = this.frontmatter.title;
    } else if (this.activeFile) {
      this.title = this.activeFile.basename;
    }
    titleInput.value = this.title;

    titleInput.addEventListener("input", () => {
      this.title = titleInput.value;
    });

    // Buttons
    const buttonContainer = contentEl.createDiv({
      cls: "wordpress-button-container"
    });

    buttonContainer
      .createEl("button", {
        text: "Cancel",
        cls: "wordpress-cancel-button"
      })
      .addEventListener("click", () => {
        this.close();
      });

    this.draftButton = buttonContainer.createEl("button", {
      text: "Save as draft",
      cls: "wordpress-draft-button"
    });
    this.draftButton.addEventListener("click", () => {
      void this.saveToWordPress("draft");
    });

    this.publishButton = buttonContainer.createEl("button", {
      text: "Publish",
      cls: "wordpress-publish-button"
    });
    this.publishButton.addEventListener("click", () => {
      void this.saveToWordPress("publish");
    });

    // Note
    contentEl.createEl("div", {
      text: "The active note will be converted and published as a WordPress article.",
      cls: "wordpress-note-text"
    });
  }

  private loadFrontmatter(): void {
    if (!this.activeFile) {
      this.logger.debug("loadFrontmatter: No active file");
      return;
    }

    const cache = this.app.metadataCache.getFileCache(this.activeFile);
    this.logger.debug("loadFrontmatter: Cache state", {
      hasCache: !!cache,
      hasFrontmatter: !!cache?.frontmatter,
      frontmatterKeys: cache?.frontmatter ? Object.keys(cache.frontmatter) : []
    });

    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      const parsed: WordPressFrontmatter = {};

      if (typeof fm.title === "string") {
        parsed.title = fm.title;
      }
      // Check for both "categorie" (French) and "category" (English)
      if (typeof fm.categorie === "string") {
        parsed.category = fm.categorie;
        this.logger.debug("Found frontmatter categorie (French)", { value: fm.categorie });
      } else if (typeof fm.category === "string") {
        parsed.category = fm.category;
        this.logger.debug("Found frontmatter category (English)", { value: fm.category });
      } else {
        this.logger.debug("No category found in frontmatter", {
          categorieType: typeof fm.categorie,
          categoryType: typeof fm.category,
          categorieValue: fm.categorie,
          categoryValue: fm.category
        });
      }
      if (
        fm.status === "publish" ||
        fm.status === "draft" ||
        fm.status === "pending" ||
        fm.status === "private"
      ) {
        parsed.status = fm.status;
      }
      if (typeof fm.slug === "string") {
        parsed.slug = fm.slug;
      }
      if (typeof fm.excerpt === "string") {
        parsed.excerpt = fm.excerpt;
      }
      if (typeof fm.subtitle === "string") {
        parsed.subtitle = fm.subtitle;
      }
      if (Array.isArray(fm.tags)) {
        parsed.tags = fm.tags.filter((t): t is string => typeof t === "string");
      }
      if (typeof fm.focus_keyword === "string") {
        parsed.focus_keyword = fm.focus_keyword;
      }

      this.frontmatter = parsed;
      this.logger.debug("Parsed frontmatter", { parsed });
    } else {
      this.logger.debug("No frontmatter cache available");
    }

    // If no subtitle in frontmatter, try to extract from first H3 in content
    if (!this.frontmatter.subtitle && this.activeFile) {
      this.extractSubtitleFromContent();
    }
  }

  /**
   * Extract subtitle from the first H3 header in the content
   * This is useful when the subtitle is in the markdown but not in frontmatter
   */
  private extractSubtitleFromContent(): void {
    if (!this.activeFile) return;

    const cache = this.app.metadataCache.getFileCache(this.activeFile);
    if (!cache?.headings) return;

    // Find the first H3 heading (typically the subtitle after H1 title)
    const h3Heading = cache.headings.find((h) => h.level === 3);
    if (h3Heading) {
      this.frontmatter.subtitle = h3Heading.heading;
      this.logger.debug("Extracted subtitle from H3", { subtitle: h3Heading.heading });
    }
  }

  /**
   * Get HTML content with enluminure support
   * Returns { html, enluminure } where enluminure contains the uploaded image info
   */
  private async getHtmlContent(): Promise<{
    html: string;
    enluminure?: WordPressEnluminureInfo | undefined;
  } | null> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("No active file selected");
      return null;
    }

    const content = await this.app.vault.cachedRead(activeFile);
    // Remove frontmatter
    let cleanContent = content.replace(/^---[\s\S]*?---\n?/, "");

    // Process images - upload local images to WordPress
    // This also detects and uploads enluminure separately
    const basePath = activeFile.parent?.path || "";
    const imageResult = await this.imageHandler.processMarkdownImages(
      cleanContent,
      basePath
    );

    // Notify user of image upload results
    if (imageResult.uploadedImages.length > 0) {
      this.logger.info(
        `Uploaded ${imageResult.uploadedImages.length} image(s) to WordPress`
      );
    }

    if (imageResult.errors.length > 0) {
      const errorCount = imageResult.errors.length;
      new Notice(
        `Warning: ${errorCount} image(s) failed to upload. Check logs for details.`
      );
      for (const err of imageResult.errors) {
        this.logger.warn(`Image upload failed: ${err.path} - ${err.error}`);
      }
    }

    cleanContent = imageResult.processedMarkdown;

    // Process wikilinks - convert to WordPress internal links
    cleanContent = await this.wikiLinkConverter.processWikiLinks(cleanContent);

    // Convert markdown to HTML
    const html = this.markdownToHtml(cleanContent);

    return {
      html,
      enluminure: imageResult.enluminure
    };
  }

  /**
   * Generate the enluminure HTML structure matching the working WordPress pages
   * Creates the medieval drop-cap effect with image floated left
   * Note: WordPress already displays the post title separately, so we don't include it here
   *
   * The enluminure image represents the first letter of the first h1 title,
   * so we remove that first letter (medieval manuscript style)
   *
   * IMPORTANT: Uses inline styles with !important to override theme CSS
   * WordPress sanitizes <style> tags, so we must use inline styles directly on elements
   * The alignwide class bypasses WordPress theme centering
   */
  private generateEnluminureHtml(
    enluminure: WordPressEnluminureInfo,
    title: string,
    bodyHtml: string
  ): string {
    const enluminureUrl = enluminure.wordpressUrl || "";

    // Remove the first letter from the first h1 title
    // The enluminure image represents this first letter (medieval manuscript style)
    // Also add inline styles to the first h1
    const processedBodyHtml = bodyHtml.replace(
      /<h1([^>]*)>(.)([\s\S]*?)<\/h1>/,
      (_match, attrs, _firstChar, restOfTitle) => {
        // Skip the first character (it's represented by the enluminure image)
        // Add inline styles to prevent clearing and adjust margins
        return `<h1 style="margin-top: 0 !important; margin-bottom: 1rem !important; clear: none !important;">${restOfTitle}</h1>`;
      }
    );

    // Add inline styles to all h2 and h3 elements to prevent clearing
    const finalBodyHtml = processedBodyHtml
      .replace(
        /<h2([^>]*)>/g,
        '<h2$1 style="clear: none !important; margin-top: 2rem; margin-bottom: 1rem;">'
      )
      .replace(
        /<h3([^>]*)>/g,
        '<h3$1 style="clear: none !important; margin-bottom: 1rem;">'
      );

    // Build the enluminure structure with:
    // 1. NO <style> tag - WordPress sanitizes it away
    // 2. Inline styles directly on elements with !important to override theme CSS
    // 3. alignwide class to bypass theme's .entry-content > * centering
    // 4. clear: none !important to override theme's .alignwide { clear: both }
    return `<div class="enluminure-container alignwide" style="position: relative; margin-bottom: 2rem; clear: none !important; max-width: 900px;">
<div class="enluminure-image-article" style="float: left !important; margin: 0 1rem 1.5rem 0 !important; max-width: 200px !important;">
<img src="${enluminureUrl}" alt="Image enluminure" style="display: block !important; width: 100% !important; height: auto !important; border-radius: 0.25rem;">
</div>
${finalBodyHtml}
</div>`;
  }

  /**
   * Simple markdown to HTML conversion
   * WordPress handles markdown rendering, but we need basic HTML for the REST API
   */
  private markdownToHtml(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.+)$/gm, '<h2 style="margin-top: 2rem;">$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Code blocks
    html = html.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_, lang, code) =>
        `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
    );

    // Images (already processed to WordPress URLs)
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />'
    );

    // Links (including converted wikilinks which are now <a> tags)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

    // Unordered lists
    html = html.replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(
      /(<li>.*<\/li>\n?)+/g,
      (match) => `<ul>\n${match}</ul>\n`
    );

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

    // Horizontal rules with proper spacing
    html = html.replace(/^---+$/gm, '<hr style="margin-top: 2rem; margin-bottom: 2rem;" />');
    html = html.replace(/^\*\*\*+$/gm, '<hr style="margin-top: 2rem; margin-bottom: 2rem;" />');
    html = html.replace(/^___+$/gm, '<hr style="margin-top: 2rem; margin-bottom: 2rem;" />');

    // Paragraphs - wrap text blocks in <p> tags
    const lines = html.split("\n");
    const result: string[] = [];
    let inParagraph = false;
    let paragraphContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Check if this is a block element
      const isBlockElement =
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("</ul") ||
        trimmed.startsWith("</ol") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("</blockquote") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("</pre") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<img") ||
        trimmed === "";

      if (isBlockElement) {
        // Close any open paragraph
        if (inParagraph && paragraphContent.length > 0) {
          result.push(`<p>${paragraphContent.join("<br />")}</p>`);
          paragraphContent = [];
          inParagraph = false;
        }
        if (trimmed !== "") {
          result.push(line);
        }
      } else {
        // Regular text line
        inParagraph = true;
        paragraphContent.push(trimmed);
      }
    }

    // Close final paragraph if needed
    if (inParagraph && paragraphContent.length > 0) {
      result.push(`<p>${paragraphContent.join("<br />")}</p>`);
    }

    return result.join("\n");
  }

  private async saveToWordPress(status: WordPressPostStatus): Promise<void> {
    if (!this.title.trim()) {
      new Notice("Please enter a title");
      return;
    }

    if (!this.category) {
      new Notice("Please select a category");
      return;
    }

    // Disable buttons IMMEDIATELY to prevent double-clicks
    const buttonText = status === "publish" ? "Publishing..." : "Saving...";
    this.setButtonsDisabled(true, buttonText);

    const contentResult = await this.getHtmlContent();
    if (!contentResult) {
      // Re-enable buttons if content fetch fails
      this.setButtonsDisabled(false);
      return;
    }

    try {
      const categoryId = this.categoryPageIds[this.category];
      if (categoryId === undefined) {
        throw new Error(`Invalid category: ${this.category}`);
      }

      // Build final HTML content
      let finalHtml: string;
      if (contentResult.enluminure && contentResult.enluminure.wordpressUrl) {
        // Has enluminure - wrap content in enluminure structure
        finalHtml = this.generateEnluminureHtml(
          contentResult.enluminure,
          this.title,
          contentResult.html
        );
        this.logger.info("Generated enluminure HTML structure");
      } else {
        // No enluminure - use content as-is
        finalHtml = contentResult.html;
      }

      // Prepare SEO options
      const seoOptions: {
        slug?: string;
        excerpt?: string;
        featuredMediaId?: number;
        rankMathMeta?: RankMathMeta;
        tags?: number[];
      } = {};

      if (this.frontmatter.slug) {
        seoOptions.slug = this.frontmatter.slug;
      }
      if (this.frontmatter.excerpt) {
        seoOptions.excerpt = this.frontmatter.excerpt;
      }
      // NOTE: We intentionally do NOT set featured_media when there's an enluminure
      // because the enluminure is already embedded in the content HTML.
      // Setting featured_media would cause WordPress to display the image twice:
      // once as the featured image (theme-controlled) and once in our custom layout.

      // Build Rank Math SEO meta
      const rankMathMeta: RankMathMeta = {};
      let hasRankMathMeta = false;

      if (this.frontmatter.focus_keyword) {
        rankMathMeta.rank_math_focus_keyword = this.frontmatter.focus_keyword;
        hasRankMathMeta = true;
      }
      if (this.frontmatter.excerpt) {
        // Use excerpt as Rank Math description (meta description)
        rankMathMeta.rank_math_description = this.frontmatter.excerpt;
        hasRankMathMeta = true;
      }
      // Use enluminure URL and ID for Open Graph image if available
      if (contentResult.enluminure?.wordpressUrl) {
        rankMathMeta.rank_math_facebook_image = contentResult.enluminure.wordpressUrl;
        if (contentResult.enluminure.mediaId) {
          rankMathMeta.rank_math_facebook_image_id = String(contentResult.enluminure.mediaId);
        }
        rankMathMeta.rank_math_twitter_use_facebook = "on";
        hasRankMathMeta = true;
      }

      if (hasRankMathMeta) {
        seoOptions.rankMathMeta = rankMathMeta;
      }

      // Resolve tags to WordPress IDs
      if (this.frontmatter.tags && this.frontmatter.tags.length > 0) {
        const tagResult = await this.api.resolveTagIds(this.frontmatter.tags);
        if (tagResult.ids.length > 0) {
          seoOptions.tags = tagResult.ids;
          this.logger.info(`Resolved ${tagResult.ids.length} tag IDs`);
        }
        if (tagResult.errors.length > 0) {
          this.logger.warn("Some tags failed to resolve", { errors: tagResult.errors });
        }
      }

      this.logger.debug("Publishing article to WordPress", {
        title: this.title,
        category: this.category,
        categoryId,
        status,
        hasEnluminure: !!contentResult.enluminure,
        seoOptions
      });

      // Check if article already exists
      const existingPost = await this.api.findPostByTitle(
        this.title,
        categoryId
      );

      let result;
      if (existingPost.success && existingPost.data) {
        // Update existing article
        this.logger.info(`Updating existing article: ${existingPost.data.id}`);
        result = await this.api.updatePost(existingPost.data.id, {
          title: this.title,
          content: finalHtml,
          status,
          categories: [categoryId],
          tags: seoOptions.tags,
          slug: seoOptions.slug,
          excerpt: seoOptions.excerpt,
          meta: seoOptions.rankMathMeta
        });
      } else {
        // Create new article
        result = await this.api.createPost(
          this.title,
          finalHtml,
          [categoryId],
          status,
          seoOptions
        );
      }

      if (result.success && result.data) {
        const action =
          existingPost.success && existingPost.data ? "Updated" : "Created";
        const statusText = status === "publish" ? "published" : "draft";
        this.logger.info(
          `${action} article: ${result.data.link} (${statusText})`
        );
        new Notice(
          `${action} ${statusText}: ${this.title}\n${result.data.link}`
        );

        // Update frontmatter with WordPress URL
        if (this.activeFile) {
          try {
            await this.app.fileManager.processFrontMatter(
              this.activeFile,
              (frontmatter) => {
                frontmatter.wordpress_url = result.data?.link;
              }
            );
            this.logger.info(
              "Updated frontmatter with WordPress URL",
              { url: result.data.link }
            );
          } catch (error) {
            this.logger.warn("Failed to update frontmatter", error);
            // Don't show error to user - the publish succeeded
          }
        }

        this.close();
      } else {
        throw new Error(result.error || "Failed to save article");
      }
    } catch (error) {
      this.logger.error("Failed to publish to WordPress", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      new Notice(`Failed to save: ${errorMessage}`);
      this.setButtonsDisabled(false);
    }
  }

  private setButtonsDisabled(disabled: boolean, text?: string) {
    if (this.draftButton) {
      this.draftButton.disabled = disabled;
      if (text) this.draftButton.textContent = text;
      else this.draftButton.textContent = "Save as draft";
    }
    if (this.publishButton) {
      this.publishButton.disabled = disabled;
      if (text) this.publishButton.textContent = text;
      else this.publishButton.textContent = "Publish";
    }
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
