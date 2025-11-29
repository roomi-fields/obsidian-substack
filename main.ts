import {
  App,
  Notice,
  Platform,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { Logger, LogLevel, createLogger } from "./src/utils/logger";
import { SubstackAPI } from "./src/substack/api";
import { SubstackPostComposer } from "./src/substack/PostComposer";
import { SubstackAuth } from "./src/substack/auth";
import { SubstackAudience, SubstackSection } from "./src/substack/types";

interface SubstackPublisherSettings {
  devMode: boolean;
  logLevel: LogLevel;
  substackCookie: string;
  publications: string[];
  defaultPublication: string;
  sections: SubstackSection[];
  defaultSectionId: number | null;
  defaultAudience: SubstackAudience;
  defaultTags: string[];
  paidSubscribersEnabled: boolean;
}

const DEFAULT_SETTINGS: SubstackPublisherSettings = {
  devMode: false,
  logLevel: LogLevel.ERROR,
  substackCookie: "",
  publications: [],
  defaultPublication: "",
  sections: [],
  defaultSectionId: null,
  defaultAudience: "everyone",
  defaultTags: [],
  paidSubscribersEnabled: false,
};

export default class SubstackPublisherPlugin extends Plugin {
  settings!: SubstackPublisherSettings;
  logger!: Logger | ReturnType<typeof createLogger>;

  override async onload() {
    await this.loadSettings();

    this.logger = createLogger(
      "Substack Publisher",
      this.settings.devMode,
      this.settings.logLevel,
    );

    if ("setApp" in this.logger) {
      this.logger.setApp(this.app);
    }

    this.logger.logPluginLoad();

    const ribbonIconEl = this.addRibbonIcon(
      "send",
      "Publish to substack",
      () => {
        this.publishToSubstack();
      },
    );

    ribbonIconEl.addClass("substack-ribbon-class");

    // Move icon to bottom of ribbon after layout is ready
    this.app.workspace.onLayoutReady(() => {
      setTimeout(() => {
        ribbonIconEl.parentElement?.appendChild(ribbonIconEl);
      }, 100);
    });

    this.addCommand({
      id: "publish-to-substack",
      name: "Publish to substack",
      callback: () => {
        this.publishToSubstack();
      },
    });

    this.addSettingTab(new SubstackPublisherSettingTab(this.app, this));
  }

  override onunload() {
    this.logger.logPluginUnload();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    if (this.logger) {
      this.logger = createLogger(
        "Substack Publisher",
        this.settings.devMode,
        this.settings.logLevel,
      );
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);

    if (this.logger) {
      this.logger = createLogger(
        "Substack Publisher",
        this.settings.devMode,
        this.settings.logLevel,
      );
    }
  }

  private publishToSubstack(): void {
    this.logger.logCommandExecution("publish-to-substack");

    if (!this.settings.substackCookie) {
      new Notice(
        "Please configure your substack authentication in settings first.",
      );
      return;
    }

    if (this.settings.publications.length === 0) {
      new Notice(
        "Please click 'refresh' in settings to fetch your publications.",
      );
      return;
    }

    const api = new SubstackAPI(this.settings.substackCookie);

    const composer = new SubstackPostComposer(
      this.app,
      api,
      this.settings.publications,
      this.logger,
      {
        defaultPublication:
          this.settings.defaultPublication ||
          this.settings.publications[0] ||
          "",
        defaultSectionId: this.settings.defaultSectionId,
        defaultAudience: this.settings.defaultAudience,
        defaultTags: this.settings.defaultTags,
        paidSubscribersEnabled: this.settings.paidSubscribersEnabled,
      },
    );
    composer.open();
  }
}

class SubstackPublisherSettingTab extends PluginSettingTab {
  plugin: SubstackPublisherPlugin;

  constructor(app: App, plugin: SubstackPublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName("Authentication").setHeading();

    // Login button (desktop only)
    if (Platform.isDesktop) {
      const authStatus = this.plugin.settings.substackCookie
        ? "✓ Logged in"
        : "Not logged in";

      new Setting(containerEl)
        .setName("Login")
        .setDesc(
          `${authStatus}. Click to open Substack login window and automatically capture your session`,
        )
        .addButton((button) => {
          button
            .setButtonText(
              this.plugin.settings.substackCookie ? "Re-login" : "Login",
            )
            .setCta()
            .onClick(() => {
              const auth = new SubstackAuth((cookie) => {
                this.plugin.settings.substackCookie = cookie;
                void this.plugin.saveSettings().then(() => {
                  this.display(); // Refresh UI
                });
              });
              auth.login();
            });
        });
    }

    // Manual cookie input (always available as fallback)
    const manualSetting = new Setting(containerEl)
      .setName("Manual cookie entry")
      .setDesc(
        Platform.isDesktop
          ? "Alternative: paste your cookie manually if auto-login doesn't work"
          : "Paste your Substack session cookie (substack.sid) from browser DevTools → Application → Cookies",
      )
      .addText((text) => {
        text
          .setPlaceholder("Enter cookie value")
          .setValue(this.plugin.settings.substackCookie)
          .onChange(async (value) => {
            this.plugin.settings.substackCookie = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.addClass("substack-input-full-width");
      });

    // On desktop, make manual entry less prominent
    if (Platform.isDesktop) {
      manualSetting.settingEl.addClass("substack-setting-muted");
    }

    new Setting(containerEl).setName("Defaults").setHeading();

    // Refresh button to fetch publications and sections
    new Setting(containerEl)
      .setName("Refresh from substack")
      .setDesc("Fetch your publications and sections from substack")
      .addButton((button) => {
        button.setButtonText("↻ refresh").onClick(async () => {
          if (!this.plugin.settings.substackCookie) {
            new Notice("Please login first.");
            return;
          }

          button.setButtonText("...");
          button.setDisabled(true);

          try {
            const api = new SubstackAPI(this.plugin.settings.substackCookie);

            // Fetch publications with paid status info
            const publicationsInfo = await api.getUserPublicationsWithInfo();
            if (publicationsInfo.length > 0) {
              this.plugin.settings.publications = publicationsInfo.map(
                (p) => p.subdomain,
              );

              // Auto-detect paid subscriptions for the default publication
              const defaultPubInfo =
                publicationsInfo.find(
                  (p) =>
                    p.subdomain === this.plugin.settings.defaultPublication,
                ) || publicationsInfo[0];

              if (defaultPubInfo) {
                this.plugin.settings.paidSubscribersEnabled =
                  defaultPubInfo.hasPaidSubscriptions;
              }

              // Set default publication if not set or invalid
              if (
                !this.plugin.settings.defaultPublication ||
                !this.plugin.settings.publications.includes(
                  this.plugin.settings.defaultPublication,
                )
              ) {
                this.plugin.settings.defaultPublication =
                  publicationsInfo[0]?.subdomain || "";
              }
            }

            // Fetch sections for default publication
            if (this.plugin.settings.defaultPublication) {
              const sections = await api.getSections(
                this.plugin.settings.defaultPublication,
              );
              this.plugin.settings.sections = sections;
              // Set default section if not set or invalid
              const validSectionIds = sections
                .filter((s) => s.is_live)
                .map((s) => s.id);
              if (
                this.plugin.settings.defaultSectionId === null ||
                !validSectionIds.includes(this.plugin.settings.defaultSectionId)
              ) {
                // Default to first live section
                const firstLive = sections.find((s) => s.is_live);
                this.plugin.settings.defaultSectionId = firstLive?.id ?? null;
              }
            }

            await this.plugin.saveSettings();
            this.display(); // Refresh UI

            const paidStatus = this.plugin.settings.paidSubscribersEnabled
              ? "paid enabled"
              : "free only";
            new Notice(
              `Refreshed: ${this.plugin.settings.publications.length} publication(s), ${this.plugin.settings.sections.length} section(s), ${paidStatus}`,
            );
          } catch (error) {
            const msg =
              error instanceof Error ? error.message : "Unknown error";
            new Notice(`Refresh failed: ${msg}`);
          } finally {
            button.setButtonText("↻ refresh");
            button.setDisabled(false);
          }
        });
      });

    // Default Publication dropdown
    const publicationSetting = new Setting(containerEl)
      .setName("Default publication")
      .setDesc(
        this.plugin.settings.publications.length === 0
          ? "Click 'refresh' above to load your publications"
          : "Publication used by default when publishing",
      );

    if (this.plugin.settings.publications.length > 0) {
      publicationSetting.addDropdown((dropdown) => {
        for (const pub of this.plugin.settings.publications) {
          dropdown.addOption(pub, pub);
        }
        dropdown.setValue(this.plugin.settings.defaultPublication || "");
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultPublication = value;
          // Reload sections for new publication
          if (this.plugin.settings.substackCookie) {
            const api = new SubstackAPI(this.plugin.settings.substackCookie);
            this.plugin.settings.sections = await api.getSections(value);
            const firstLive = this.plugin.settings.sections.find(
              (s) => s.is_live,
            );
            this.plugin.settings.defaultSectionId = firstLive?.id ?? null;
          }
          await this.plugin.saveSettings();
          this.display(); // Refresh to update sections dropdown
        });
      });
    }

    // Default Section dropdown
    const liveSections = this.plugin.settings.sections.filter((s) => s.is_live);
    const sectionSetting = new Setting(containerEl)
      .setName("Default section")
      .setDesc(
        liveSections.length === 0
          ? "Click 'refresh' above to load your sections"
          : "Section used by default when publishing",
      );

    if (liveSections.length > 0) {
      sectionSetting.addDropdown((dropdown) => {
        for (const section of liveSections) {
          dropdown.addOption(section.id.toString(), section.name);
        }
        dropdown.setValue(
          this.plugin.settings.defaultSectionId?.toString() || "",
        );
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultSectionId = value
            ? parseInt(value)
            : null;
          await this.plugin.saveSettings();
        });
      });
    }

    // Paid subscribers toggle (informational, auto-detected)
    new Setting(containerEl)
      .setName("Paid subscribers enabled")
      .setDesc("Auto-detected from substack. Toggle manually if incorrect.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.paidSubscribersEnabled)
          .onChange(async (value) => {
            this.plugin.settings.paidSubscribersEnabled = value;
            // Reset to "everyone" if disabling paid
            if (!value) {
              this.plugin.settings.defaultAudience = "everyone";
            }
            await this.plugin.saveSettings();
            this.display(); // Refresh to update audience options
          }),
      );

    // Default Audience dropdown - only show if paid subscribers enabled
    if (this.plugin.settings.paidSubscribersEnabled) {
      new Setting(containerEl)
        .setName("Default audience")
        .setDesc("Audience used by default when publishing")
        .addDropdown((dropdown) => {
          dropdown.addOption("everyone", "Everyone");
          dropdown.addOption("only_paid", "Paid subscribers only");
          dropdown.addOption("founding", "Founding members only");
          dropdown.addOption("only_free", "Free subscribers only");
          dropdown.setValue(this.plugin.settings.defaultAudience);
          dropdown.onChange(async (value) => {
            this.plugin.settings.defaultAudience = value as SubstackAudience;
            await this.plugin.saveSettings();
          });
        });
    }

    // Default Tags
    new Setting(containerEl)
      .setName("Default tags")
      .setDesc("Tags added by default when publishing (comma-separated)")
      .addText((text) => {
        text
          .setPlaceholder("Enter tags")
          .setValue(this.plugin.settings.defaultTags.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.defaultTags = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl).setName("Advanced").setHeading();

    new Setting(containerEl)
      .setName("Dev mode")
      .setDesc(
        "Enable detailed logging for debugging. Only enable when troubleshooting issues.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.devMode)
          .onChange(async (value) => {
            this.plugin.settings.devMode = value;
            await this.plugin.saveSettings();

            const status = value ? "enabled" : "disabled";
            const message =
              status === "enabled" ? "Check console for detailed logs." : "";
            new Notice(`dev mode ${status}. ${message}`);

            this.display();
          }),
      );

    if (this.plugin.settings.devMode) {
      new Setting(containerEl)
        .setName("Log level")
        .setDesc("Set the minimum log level to display")
        .addDropdown((dropdown) =>
          dropdown
            .addOption(LogLevel.DEBUG.toString(), "Debug")
            .addOption(LogLevel.INFO.toString(), "Info")
            .addOption(LogLevel.WARN.toString(), "Warning")
            .addOption(LogLevel.ERROR.toString(), "Error")
            .setValue(this.plugin.settings.logLevel.toString())
            .onChange(async (value) => {
              this.plugin.settings.logLevel = parseInt(value) as LogLevel;
              await this.plugin.saveSettings();

              if (this.plugin.logger && "setLogLevel" in this.plugin.logger) {
                this.plugin.logger.setLogLevel(this.plugin.settings.logLevel);
              }
            }),
        );
    }

    // Version info
    const versionSection = containerEl.createDiv();
    versionSection.addClass("substack-version-wrapper");

    const versionContent = versionSection.createEl("div", {
      attr: { class: "substack-version-content" },
    });

    versionContent.createEl("p", {
      text: "Substack publisher",
      attr: { class: "substack-version-name" },
    });

    versionContent.createEl("a", {
      text: "Roomi-fields",
      href: "https://github.com/roomi-fields",
      attr: { class: "substack-version-author" },
    });

    versionContent.createEl("span", {
      text: `v${this.plugin.manifest.version}`,
      attr: { class: "substack-version-number" },
    });
  }
}
