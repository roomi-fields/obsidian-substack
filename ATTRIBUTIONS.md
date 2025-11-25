# Attributions

This project is built upon the work of others. We are grateful for their contributions to the open-source community.

## Source Projects

### obsidian-content-os

- **Author**: [eharris128](https://github.com/eharris128)
- **Repository**: https://github.com/eharris128/obsidian-content-os
- **License**: MIT
- **Usage**: Obsidian plugin structure, UI patterns, settings management

**Files derived from this project:**
- `main.ts` - Plugin entry point structure
- `src/utils/logger.ts` - Logging utility
- `src/substack/PostComposer.ts` - Modal UI pattern (adapted from `src/linkedin/PostComposer.ts`)
- `esbuild.config.mjs` - Build configuration
- `styles.css` - CSS styling patterns

### substack-mcp-plus

- **Author**: [ty13r](https://github.com/ty13r)
- **Repository**: https://github.com/ty13r/substack-mcp-plus
- **License**: MIT
- **Usage**: Substack API integration logic, authentication patterns, content conversion

**Concepts adapted from this project:**
- `src/substack/api.ts` - API client logic (adapted from Python handlers)
- `src/substack/converter.ts` - Markdown to Substack JSON conversion
- `src/substack/auth.ts` - Cookie-based authentication pattern

### python-substack

- **Author**: [ma2za](https://github.com/ma2za)
- **Repository**: https://github.com/ma2za/python-substack
- **License**: MIT
- **Usage**: Underlying Substack API research (used by substack-mcp-plus)

## File Attribution Headers

Each adapted file contains attribution headers in the following format:

```typescript
/**
 * Adapted from obsidian-content-os by eharris128
 * Original: https://github.com/eharris128/obsidian-content-os
 *
 * Substack API logic adapted from substack-mcp-plus by ty13r
 * Original: https://github.com/ty13r/substack-mcp-plus
 */
```

## License Compliance

All source projects are licensed under the MIT License, which permits:
- Commercial use
- Modification
- Distribution
- Private use

As required by MIT License, we:
- Include the original copyright notices
- Include the license text
- Provide clear attribution to original authors

## Thank You

Special thanks to:
- **eharris128** for creating an excellent Obsidian plugin template
- **ty13r** for reverse-engineering and documenting the Substack API
- **ma2za** for the foundational python-substack library
- The Obsidian community for their support and feedback
