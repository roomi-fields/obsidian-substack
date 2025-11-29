# Roadmap - Obsidian Substack Publisher

## v1.0.7 ✅

- [x] Automatic Substack login (desktop only)
- [x] Session cookie capture via Electron BrowserWindow
- [x] Multi-publication support
- [x] Markdown → Substack JSON conversion
  - Headers (h1-h6)
  - Paragraphs with inline formatting (bold, italic, code, links)
  - Ordered/unordered lists
  - Code blocks with language
  - Blockquotes
  - Images (external URLs)
  - Horizontal rules
- [x] Publication modal with preview
- [x] Save as Draft / Publish directly
- [x] Clear error messages (session expired, publication not found, etc.)
- [x] CI/CD with GitHub Actions
- [x] Codecov integration for coverage tracking
- [x] 47% test coverage (120 tests)

---

## v1.1.0 ✅

- [x] Upload local images to Substack CDN (PNG, JPG)
- [x] Support embedded images `![alt](path/to/image.png)`
- [x] Auto-convert local paths → Substack URLs

## v1.2.0 ✅

- [x] YAML frontmatter support (`title`, `subtitle`, `audience`, `tags`, `section`)
- [x] Audience selector (everyone, paid only, free only, founding)
- [x] Tags support via frontmatter and modal input
- [x] Section support (fetched from publication, select in modal)
- [x] Ribbon icon position fixed (bottom of ribbon)
- [x] Auto-detect paid subscriptions from publication settings
- [x] Default settings for publication, section, audience, tags
- [x] Refresh button to fetch publications/sections from Substack

## v1.3.0 - Publication améliorée

- [ ] Post link display after publication
- [ ] Update existing draft (link note ↔ draft via frontmatter)
- [ ] Cover image support (upload + set as post cover)

## v1.4.0 - Advanced Features

- [ ] Paywall marker in Markdown (`<!-- paywall -->`)
- [ ] Scheduled publishing (if feasible)

---

## v2.0.0 - Simplification

- [ ] Remove preview window (not useful)
- [ ] Post templates
- [ ] Paywall improvements (if v1.3 paywall works well)

---

## Backlog (Unprioritized)

- [ ] Substack podcast support
- [ ] Import Substack posts → Obsidian
- [ ] Reverse conversion (Substack JSON → Markdown)
- [ ] Footnotes support
- [ ] Markdown tables support
- [ ] Integration with other platforms (Medium, Ghost, etc.)
- [ ] Offline mode with publish queue
- [ ] Publication history in dedicated note

---

## Known Limitations

- Unofficial Substack API (may change without notice)
- Cookie expires after ~30 days
- No OAuth support (Substack doesn't offer it)
