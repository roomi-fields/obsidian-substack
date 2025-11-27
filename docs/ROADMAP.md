# Roadmap - Obsidian Substack Publisher

## v1.0.7 ✅ (Current)

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

## v1.1.0 - Image Upload

- [ ] Upload local images to Substack CDN (PNG, JPG)
- [ ] Support embedded images `![alt](path/to/image.png)`
- [ ] Auto-convert local paths → Substack URLs

## v1.2.0 - Publication améliorée

- [ ] Audience selector (everyone, paid only, free only, founding)
- [ ] Post link display after publication
- [ ] YAML frontmatter support (`title`, `subtitle`, `audience`)
- [ ] Update existing draft (link note ↔ draft via frontmatter)

## v1.3.0 - Cover Image & Metadata

- [ ] Cover image support (upload + set as post cover)
- [ ] Paywall marker in Markdown (`<!-- paywall -->`)
- [ ] Scheduled publishing (if feasible)

## v1.4.0 - Tags & Sections

- [ ] Tags support via frontmatter
- [ ] Section support (categorize posts)

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
