import { App, Modal, Notice, TFile } from "obsidian";
import { SubstackAPI } from "./api";
import { createLogger } from "../utils/logger";

export class SubstackPostComposer extends Modal {
  private api: SubstackAPI;
  private publications: string[];
  private logger: ReturnType<typeof createLogger>;
  private selectedPublication: string;
  private title: string = "";
  private subtitle: string = "";
  private publishButton: HTMLButtonElement | null = null;
  private draftButton: HTMLButtonElement | null = null;

  constructor(
    app: App,
    api: SubstackAPI,
    publications: string[],
    logger: ReturnType<typeof createLogger>
  ) {
    super(app);
    this.api = api;
    this.publications = publications;
    this.logger = logger;
    this.selectedPublication = publications[0] || "";
  }

  override onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "Publish to Substack" });

    // Publication selector
    const pubContainer = contentEl.createDiv({ cls: "substack-field-container" });
    pubContainer.createEl("label", { text: "Publication" });
    const pubSelect = pubContainer.createEl("select", { cls: "substack-select" });

    for (const pub of this.publications) {
      const option = pubSelect.createEl("option", { text: pub, value: pub });
      if (pub === this.selectedPublication) {
        option.selected = true;
      }
    }

    pubSelect.addEventListener("change", () => {
      this.selectedPublication = pubSelect.value;
    });

    // Title input
    const titleContainer = contentEl.createDiv({ cls: "substack-field-container" });
    titleContainer.createEl("label", { text: "Title" });
    const titleInput = titleContainer.createEl("input", {
      type: "text",
      placeholder: "Post title",
      cls: "substack-input",
    });

    // Pre-fill with active file name if available
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.title = activeFile.basename;
      titleInput.value = this.title;
    }

    titleInput.addEventListener("input", () => {
      this.title = titleInput.value;
    });

    // Subtitle input
    const subtitleContainer = contentEl.createDiv({ cls: "substack-field-container" });
    subtitleContainer.createEl("label", { text: "Subtitle (optional)" });
    const subtitleInput = subtitleContainer.createEl("input", {
      type: "text",
      placeholder: "Post subtitle",
      cls: "substack-input",
    });

    subtitleInput.addEventListener("input", () => {
      this.subtitle = subtitleInput.value;
    });

    // Content preview
    const previewContainer = contentEl.createDiv({ cls: "substack-preview-container" });
    previewContainer.createEl("label", { text: "Content preview" });
    const preview = previewContainer.createEl("div", { cls: "substack-preview" });

    if (activeFile) {
      this.app.vault.cachedRead(activeFile).then((content) => {
        // Remove frontmatter for preview
        const cleanContent = content.replace(/^---[\s\S]*?---\n?/, "");
        preview.textContent = cleanContent.slice(0, 500) + (cleanContent.length > 500 ? "..." : "");
      });
    } else {
      preview.textContent = "No active file selected";
    }

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: "substack-button-container" });

    buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "substack-cancel-button",
    }).addEventListener("click", () => {
      this.close();
    });

    this.draftButton = buttonContainer.createEl("button", {
      text: "Save as Draft",
      cls: "substack-draft-button",
    });
    this.draftButton.addEventListener("click", async () => {
      await this.saveDraft();
    });

    this.publishButton = buttonContainer.createEl("button", {
      text: "Publish",
      cls: "substack-publish-button",
    });
    this.publishButton.addEventListener("click", async () => {
      await this.publish();
    });

    // Note
    contentEl.createEl("div", {
      text: "Note: The active note will be converted and published to Substack.",
      cls: "substack-note-text",
    });
  }

  private async getMarkdownContent(): Promise<string | null> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("No active file selected");
      return null;
    }

    const content = await this.app.vault.cachedRead(activeFile);
    // Remove frontmatter
    return content.replace(/^---[\s\S]*?---\n?/, "");
  }

  private async saveDraft() {
    if (!this.title.trim()) {
      new Notice("Please enter a title");
      return;
    }

    const content = await this.getMarkdownContent();
    if (!content) return;

    this.setButtonsDisabled(true, "Saving...");

    try {
      this.logger.debug("Creating Substack draft", {
        publication: this.selectedPublication,
        title: this.title,
      });

      // TODO: Convert markdown to Substack JSON format
      // For now, use a simple paragraph structure
      const body = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: content }],
          },
        ],
      };

      const response = await this.api.createDraft(
        this.selectedPublication,
        this.title,
        body,
        this.subtitle
      );

      if (response.status === 200 || response.status === 201) {
        this.logger.info("Draft created successfully");
        new Notice("Draft saved to Substack!");
        this.close();
      } else {
        throw new Error(`Failed to create draft: ${response.status}`);
      }
    } catch (error) {
      this.logger.error("Failed to create draft", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      new Notice(`Failed to save draft: ${errorMessage}`);
      this.setButtonsDisabled(false);
    }
  }

  private async publish() {
    if (!this.title.trim()) {
      new Notice("Please enter a title");
      return;
    }

    const content = await this.getMarkdownContent();
    if (!content) return;

    this.setButtonsDisabled(true, "Publishing...");

    try {
      this.logger.debug("Publishing to Substack", {
        publication: this.selectedPublication,
        title: this.title,
      });

      // TODO: Convert markdown to Substack JSON format
      const body = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: content }],
          },
        ],
      };

      // First create draft
      const draftResponse = await this.api.createDraft(
        this.selectedPublication,
        this.title,
        body,
        this.subtitle
      );

      if (draftResponse.status !== 200 && draftResponse.status !== 201) {
        throw new Error(`Failed to create draft: ${draftResponse.status}`);
      }

      const draftId = draftResponse.json.id;

      // Then publish
      const publishResponse = await this.api.publishDraft(
        this.selectedPublication,
        draftId
      );

      if (publishResponse.status === 200 || publishResponse.status === 201) {
        this.logger.info("Post published successfully");
        new Notice("Published to Substack!");
        this.close();
      } else {
        throw new Error(`Failed to publish: ${publishResponse.status}`);
      }
    } catch (error) {
      this.logger.error("Failed to publish", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      new Notice(`Failed to publish: ${errorMessage}`);
      this.setButtonsDisabled(false);
    }
  }

  private setButtonsDisabled(disabled: boolean, text?: string) {
    if (this.draftButton) {
      this.draftButton.disabled = disabled;
      if (text) this.draftButton.textContent = text;
      else this.draftButton.textContent = "Save as Draft";
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
