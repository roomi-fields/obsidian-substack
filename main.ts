import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from "obsidian";
import { Logger, LogLevel, createLogger } from "./src/utils/logger";
import { SubstackAPI } from "./src/substack/api";
import { SubstackPostComposer } from "./src/substack/PostComposer";

interface SubstackPublisherSettings {
  devMode: boolean;
  logLevel: LogLevel;
  substackCookie: string;
  publications: string[]; // List of publication subdomains
}

const DEFAULT_SETTINGS: SubstackPublisherSettings = {
  devMode: false,
  logLevel: LogLevel.ERROR,
  substackCookie: "",
  publications: []
};

export default class SubstackPublisherPlugin extends Plugin {
  settings!: SubstackPublisherSettings;
  logger!: Logger | ReturnType<typeof createLogger>;

  override async onload() {
    await this.loadSettings();

    this.logger = createLogger(
      "Substack Publisher",
      this.settings.devMode,
      this.settings.logLevel
    );

    this.logger.logPluginLoad();
    this.logger.debug("Settings loaded", this.settings);

    const ribbonIconEl = this.addRibbonIcon(
      "send",
      "Publish to Substack",
      () => {
        this.logger.debug("Ribbon icon clicked");
        this.publishToSubstack();
      }
    );

    ribbonIconEl.addClass("substack-ribbon-class");

    this.addCommand({
      id: "publish-to-substack",
      name: "Publish to Substack",
      callback: async () => {
        await this.publishToSubstack();
      }
    });

    this.addSettingTab(new SubstackPublisherSettingTab(this.app, this));

    this.logger.info("Plugin initialization completed");
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
        this.settings.logLevel
      );
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);

    if (this.logger) {
      this.logger = createLogger(
        "Substack Publisher",
        this.settings.devMode,
        this.settings.logLevel
      );
      this.logger.debug("Settings saved");
    }
  }

  private async publishToSubstack() {
    this.logger.logCommandExecution("publish-to-substack");

    if (!this.settings.substackCookie) {
      new Notice("Please configure your Substack cookie in settings first");
      return;
    }

    if (this.settings.publications.length === 0) {
      new Notice("Please add at least one publication in settings first");
      return;
    }

    const api = new SubstackAPI(this.settings.substackCookie);

    const composer = new SubstackPostComposer(
      this.app,
      api,
      this.settings.publications,
      this.logger
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

    containerEl.createEl("h2", { text: "Substack Authentication" });

    new Setting(containerEl)
      .setName("Substack cookie")
      .setDesc(
        "Your Substack session cookie (substack.sid or connect.sid). Get it from browser dev tools."
      )
      .addText((text) => {
        text
          .setPlaceholder("Enter your Substack cookie")
          .setValue(this.plugin.settings.substackCookie)
          .onChange(async (value) => {
            this.plugin.settings.substackCookie = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
      });

    containerEl.createEl("h2", { text: "Publications" });

    new Setting(containerEl)
      .setName("Publication subdomains")
      .setDesc(
        "Comma-separated list of your Substack publication subdomains (e.g., mypub, anotherpub)"
      )
      .addText((text) => {
        text
          .setPlaceholder("mypub, anotherpub")
          .setValue(this.plugin.settings.publications.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.publications = value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h2", { text: "Developer Options" });

    new Setting(containerEl)
      .setName("Dev mode")
      .setDesc(
        "Enable detailed logging for debugging. Only enable when troubleshooting issues."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.devMode)
          .onChange(async (value) => {
            this.plugin.settings.devMode = value;
            await this.plugin.saveSettings();

            const status = value ? "enabled" : "disabled";
            const message = status === "enabled" ? "Check console for detailed logs." : "";
            new Notice(`Dev mode ${status}. ${message}`);

            this.display();
          })
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
            })
        );
    }

    const versionSection = containerEl.createDiv();
    versionSection.addClass("substack-version-wrapper");

    const versionContent = versionSection.createEl("div", {
      attr: { class: "substack-version-content" }
    });

    versionContent.createEl("p", {
      text: "Substack Publisher",
      attr: { class: "substack-version-name" }
    });

    versionContent.createEl("p", {
      text: "By Romi",
      attr: { class: "substack-version-author" }
    });

    const versionNumber = versionContent.createEl("span", {
      text: `v${this.plugin.manifest.version}`,
      attr: { class: "substack-version-number" }
    });
    versionContent.appendChild(versionNumber);
  }
}
