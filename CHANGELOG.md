# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-26

### Added
- **Substack Authentication**
  - Automatic login via Electron BrowserWindow (desktop only)
  - Session cookie capture after user authentication
  - Manual cookie entry as fallback

- **Publishing Features**
  - Create drafts from Obsidian notes
  - Publish posts directly to Substack
  - Multi-publication support
  - Title and subtitle editing

- **Markdown Conversion**
  - Headers (H1-H6)
  - Paragraphs with inline formatting (bold, italic)
  - Links
  - Ordered and unordered lists
  - Code blocks and inline code
  - Blockquotes
  - Horizontal rules

- **User Interface**
  - Post composer modal
  - Publication selector
  - Content preview
  - Draft/Publish buttons
  - Clear error messages

- **Developer Features**
  - Dev mode with configurable log levels
  - TypeScript with strict typing
  - ESLint configuration
  - Vitest test setup

### Credits
Built upon open-source projects:
- [obsidian-content-os](https://github.com/eharris128/obsidian-content-os) by @eharris128
- [substack-mcp-plus](https://github.com/ty13r/substack-mcp-plus) by @ty13r
- [python-substack](https://github.com/ma2za/python-substack) by @ma2za

---

[1.0.0]: https://github.com/roomi-fields/obsidian-substack/releases/tag/v1.0.0
