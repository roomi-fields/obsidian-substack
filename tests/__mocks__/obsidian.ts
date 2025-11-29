import { vi } from "vitest";

// Mock requestUrl
export const requestUrl = vi.fn().mockResolvedValue({
  status: 200,
  json: { id: "draft-123" },
});

// Mock Platform
export const Platform = {
  isDesktop: true,
  isMobile: false,
};

// Mock Notice
export const Notice = vi.fn();

// Mock App
export const App = vi.fn();

// Mock Modal
export class Modal {
  app: unknown;
  contentEl = {
    empty: vi.fn(),
    createDiv: vi.fn().mockReturnValue({
      createEl: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
      }),
    }),
    createEl: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
    }),
  };

  constructor(app: unknown) {
    this.app = app;
  }

  open() {}
  close() {}
  onOpen() {}
  onClose() {}
}

// Mock Setting
export class Setting {
  constructor(_containerEl: unknown) {}
  setName(_name: string) {
    return this;
  }
  setDesc(_desc: string) {
    return this;
  }
  setHeading() {
    return this;
  }
  addText(_cb: unknown) {
    return this;
  }
  addToggle(_cb: unknown) {
    return this;
  }
  addButton(_cb: unknown) {
    return this;
  }
  addDropdown(_cb: unknown) {
    return this;
  }
}

// Mock TFile
export class TFile {
  path: string;
  basename: string;

  constructor(path: string) {
    this.path = path;
    this.basename = path.split("/").pop()?.replace(".md", "") || "";
  }
}

// Mock RequestUrlResponse
export interface RequestUrlResponse {
  status: number;
  json: unknown;
}
