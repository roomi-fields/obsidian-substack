# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/obsidian-substack.git
   cd obsidian-substack
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/roomi-fields/obsidian-substack.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm
- Git

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests to verify setup
npm test
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode with watch |
| `npm run build` | Build for production |
| `npm test` | Run test suite |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run format` | Format code with Prettier |

## Making Changes

### Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or modifying tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(auth): add OAuth2 support"

# Bug fix
git commit -m "fix(api): handle null response correctly"

# Documentation
git commit -m "docs: update installation instructions"

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: response.data is now response.result"
```

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request** on GitHub

4. **Fill out the PR template** with:
   - Summary of changes
   - Related issues
   - Testing performed
   - Screenshots (if applicable)

5. **Wait for review** and address any feedback

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] No unnecessary files included

## Coding Standards

### TypeScript

- Use strict TypeScript settings
- Prefer `const` over `let`
- Use explicit return types for public functions
- Avoid `any` type when possible

### Formatting

- Use Prettier for code formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multi-line structures

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `getUserById` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Interfaces | PascalCase | `UserConfig` |
| Types | PascalCase | `UserId` |

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts
```

### Writing Tests

- Place tests next to source files (`*.spec.ts`) or in `tests/` directory
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies

### Test Coverage

- Aim for >80% code coverage
- Focus on testing business logic
- Don't test framework code

## Documentation

### Code Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for public APIs

### README Updates

- Update README for new features
- Include usage examples
- Document configuration options

### Changelog

- Document changes in CHANGELOG.md
- Follow Keep a Changelog format
- Link to relevant issues/PRs

## Questions?

- Open an [Issue](https://github.com/roomi-fields/obsidian-substack/issues) for bugs
- Start a [Discussion](https://github.com/roomi-fields/obsidian-substack/discussions) for questions

Thank you for contributing!
