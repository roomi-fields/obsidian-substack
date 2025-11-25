# Obsidian Substack Publisher

Publish your Obsidian notes directly to Substack as drafts or published posts.

## Overview

Obsidian Substack Publisher bridges the gap between your note-taking and newsletter publishing workflows. Create and publish Substack posts directly from Obsidian without switching between applications.

## Features

- **Seamless Workflow**: Create Substack posts without leaving Obsidian
- **Draft & Publish**: Create drafts or publish directly
- **Multi-Publication Support**: Manage multiple Substack publications
- **Markdown Conversion**: Automatic conversion of Obsidian markdown to Substack format
- **User-Friendly Interface**: Simple modal for composing and publishing posts

## Quick Start

### 1. Installation

1. Download the plugin files
2. Place them in your Obsidian plugins directory: `.obsidian/plugins/obsidian-substack/`
3. Enable the plugin in Obsidian settings

### 2. Substack Authentication

1. Open plugin settings
2. Enter your Substack session cookie (`connect.sid`)
3. Add your publication URL(s)
4. Click "Validate" to verify the connection

#### Getting Your Session Cookie

1. Log in to Substack in your browser
2. Open Developer Tools (F12)
3. Go to Application > Cookies > substack.com
4. Copy the value of `substack.sid` or `connect.sid`

### 3. Create Your First Post

- Use the ribbon icon to open the post composer
- Or use the command palette: "Create Substack post"
- Write your content in the modal
- Choose "Save as Draft" or "Publish"

## Usage

### Creating Posts

1. **Ribbon Icon**: Click the Substack icon in the left ribbon
2. **Command Palette**: Search for "Create Substack post"
3. **Write Content**: Enter your post content in the modal
4. **Select Publication**: Choose target publication (if multiple configured)
5. **Publish Options**: Save as draft or publish immediately

### Settings Configuration

- **Session Cookie**: Your Substack authentication cookie
- **Publications**: List of your Substack publication URLs
- **Default Publication**: Primary publication for quick posting
- **Dev Mode**: Enable for detailed logging and debugging

## Privacy & Security

- **Local Storage**: All credentials are stored locally in Obsidian
- **No Data Collection**: This plugin doesn't collect or transmit user data
- **Cookie Auth**: Uses your existing Substack session (no passwords stored)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev      # Development with file watching
npm run build    # Production build
npm run lint     # Code linting
npm run test     # Run tests
```

### Project Structure

```
├── main.ts                 # Main plugin entry point
├── manifest.json           # Plugin metadata
├── src/
│   ├── substack/
│   │   ├── api.ts          # Substack API integration
│   │   ├── auth.ts         # Authentication management
│   │   ├── converter.ts    # Markdown to Substack conversion
│   │   └── PostComposer.ts # Post creation modal
│   └── utils/
│       └── logger.ts       # Logging utility
└── README.md
```

## Troubleshooting

### Common Issues

**Cookie Invalid/Expired**
- Get a fresh cookie from your browser
- Ensure you're logged into Substack
- Cookies typically expire after 30 days

**Post Failed to Publish**
- Verify your internet connection
- Check that your publication URL is correct
- Ensure content doesn't violate Substack's guidelines

**Plugin Not Loading**
- Enable dev mode in settings for detailed logs
- Check the developer console for error messages
- Verify plugin files are in the correct directory

## Limitations

- Uses unofficial Substack API (may break if Substack changes their API)
- Image upload not yet supported (v1)
- Scheduling not supported (API limitation)

## Credits

This plugin is built upon:

- [obsidian-content-os](https://github.com/eharris128/obsidian-content-os) by @eharris128 - Obsidian plugin structure
- [substack-mcp-plus](https://github.com/ty13r/substack-mcp-plus) by @ty13r - Substack API integration
- [python-substack](https://github.com/ma2za/python-substack) by @ma2za - Unofficial Substack library

All original projects are MIT licensed. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for details.

## Disclaimer

This plugin is not affiliated with or endorsed by Substack. It uses unofficial, reverse-engineered API endpoints that may change without notice. Use at your own risk and always consult Substack's Terms of Service.

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Report an issue](https://github.com/roomi-fields/obsidian-substack/issues)
