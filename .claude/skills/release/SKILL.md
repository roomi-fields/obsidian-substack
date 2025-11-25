---
name: release
description: Automates the complete release process for npm packages. This skill should be used when the user requests to publish a new version, bump version numbers, sync versions across files, update changelog, build, tag, and publish to npm and GitHub.
---

# Release Management Skill

## Overview

This skill automates the complete release workflow for npm packages, ensuring consistent versioning, changelog updates, and proper publication to npm and GitHub.

## Project Structure

Files that may need version updates:
- `package.json` - Source of truth for version (ALWAYS update first)
- `README.md` - Version badges, installation commands
- `CHANGELOG.md` - Release history

## Pre-Release Checklist

Before starting a release:
1. Ensure all tests pass: `npm test`
2. Ensure code is formatted: `npm run format:check`
3. Ensure linting passes: `npm run lint`
4. Ensure build succeeds: `npm run build`
5. Ensure working directory is clean: `git status`
6. Ensure you're on the main branch: `git branch --show-current`

## Release Workflow

### 1. Determine Version Bump

Follow semantic versioning (SemVer):
- **MAJOR** (x.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### 2. Update Version in package.json

```bash
# For patch release
npm version patch --no-git-tag-version

# For minor release
npm version minor --no-git-tag-version

# For major release
npm version major --no-git-tag-version
```

### 3. Update CHANGELOG.md

Add a new section at the top of CHANGELOG.md:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features
```

### 4. Update Version References

Search and update version strings in:
- README.md (installation commands, badges)
- Any hardcoded version strings in source code

### 5. Build and Test

```bash
npm run build
npm test
```

### 6. Commit and Tag

```bash
git add -A
git commit -m "chore: release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

### 7. Push to GitHub

```bash
git push origin main
git push origin vX.Y.Z
```

### 8. Publish to npm

```bash
npm publish --access public
```

### 9. Create GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-from-tag
```

## Troubleshooting

### npm publish fails
- Check you're logged in: `npm whoami`
- Check package name is available
- Verify you have publish rights to the scope

### Tag already exists
- Delete local tag: `git tag -d vX.Y.Z`
- Delete remote tag: `git push origin :refs/tags/vX.Y.Z`

### Version mismatch
- Always update package.json first
- Use the version sync script to update all references

## Scripts

### update-version.cjs

Use this script to automatically update version references across the project:

```bash
node .claude/skills/release/scripts/update-version.cjs
```
