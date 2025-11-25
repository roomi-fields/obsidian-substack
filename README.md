# Obsidian Substack Publisher

Publish your Obsidian notes directly to Substack as drafts or published posts.

## Features

- **Automatic Login**: One-click Substack authentication (desktop only)
- **Draft & Publish**: Save as draft or publish immediately
- **Multi-Publication Support**: Manage multiple Substack publications
- **Markdown Conversion**: Automatic conversion to Substack format
  - Headers, paragraphs, lists (ordered/unordered)
  - Bold, italic, links, code
  - Blockquotes, horizontal rules

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings → Community plugins
2. Search for "Substack Publisher"
3. Install and enable

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/roomi-fields/obsidian-substack/releases)
2. Create folder: `.obsidian/plugins/obsidian-substack/`
3. Copy the files into this folder
4. Restart Obsidian and enable the plugin

## Setup

### 1. Login to Substack

**Desktop (Recommended)**:
1. Open plugin settings
2. Click "Login" button
3. Sign in to Substack in the popup window
4. Cookie is captured automatically

**Mobile/Manual**:
1. Log in to Substack in your browser
2. Open Developer Tools (F12) → Application → Cookies
3. Copy the `substack.sid` cookie value
4. Paste it in plugin settings

### 2. Add Your Publication(s)

1. Go to plugin settings
2. Enter your publication subdomain(s)
   - Example: if your Substack is `myname.substack.com`, enter `myname`
   - Multiple publications: separate with commas

## Usage

1. Open any Markdown note in Obsidian
2. Click the "Send" ribbon icon or use command palette: "Publish to Substack"
3. Review title and subtitle
4. Choose your publication
5. Click "Save as Draft" or "Publish"

## Supported Markdown

| Element | Support |
|---------|---------|
| Headers (H1-H6) | ✅ |
| Bold, Italic | ✅ |
| Links | ✅ |
| Ordered lists | ✅ |
| Unordered lists | ✅ |
| Blockquotes | ✅ |
| Code blocks | ✅ |
| Inline code | ✅ |
| Horizontal rules | ✅ |
| Images | ❌ (coming soon) |
| Tables | ❌ |

## Troubleshooting

**"Session expired or invalid"**
- Re-login via Settings → Login button
- Or refresh your cookie manually

**"Publication not found"**
- Verify your publication subdomain is correct
- Ensure you have write access to the publication

**Plugin not working on mobile**
- Auto-login requires desktop Obsidian
- Use manual cookie entry on mobile

## Privacy & Security

- Credentials stored locally in your Obsidian vault
- No data collection or telemetry
- Cookie-based auth (no passwords stored)

## Limitations

- Uses unofficial Substack API (may break if Substack changes their API)
- Image upload not supported (v1)
- Desktop-only for auto-login feature

## Credits

Built upon these open-source projects:

- [obsidian-content-os](https://github.com/eharris128/obsidian-content-os) by @eharris128
- [substack-mcp-plus](https://github.com/ty13r/substack-mcp-plus) by @ty13r
- [python-substack](https://github.com/ma2za/python-substack) by @ma2za

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for details.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- [Report an issue](https://github.com/roomi-fields/obsidian-substack/issues)
- [Feature requests](https://github.com/roomi-fields/obsidian-substack/issues/new)

---

**Disclaimer**: This plugin is not affiliated with or endorsed by Substack. Use at your own risk.
