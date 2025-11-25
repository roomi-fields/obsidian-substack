# Installation Guide

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Git**: For cloning the repository (if installing from source)

### Verify Prerequisites

```bash
node --version   # Should be >= 18.0.0
npm --version    # Should be >= 8.0.0
```

## Installation Methods

### Method 1: npm (Recommended)

Install globally:

```bash
npm install -g @your-scope/project-name
```

Or install locally in your project:

```bash
npm install @your-scope/project-name
```

### Method 2: From Source

Clone and build:

```bash
# Clone the repository
git clone https://github.com/your-username/project-name.git
cd project-name

# Install dependencies
npm install

# Build
npm run build
```

## Post-Installation

### 1. Create Configuration

```bash
# Copy example configuration
cp .env.example .env

# Edit with your settings
nano .env  # or your preferred editor
```

### 2. Verify Installation

```bash
# Check version
project-name --version

# Or run directly
npm start
```

### 3. Test the Application

```bash
# Run tests
npm test

# Check health endpoint (if applicable)
curl http://localhost:3000/health
```

## Updating

### npm Installation

```bash
npm update -g @your-scope/project-name
```

### Source Installation

```bash
git pull origin main
npm install
npm run build
```

## Uninstalling

### npm Installation

```bash
npm uninstall -g @your-scope/project-name
```

### Source Installation

```bash
rm -rf /path/to/project-name
```

## Troubleshooting Installation

### Permission Errors (npm global)

```bash
# Option 1: Use sudo (Linux/macOS)
sudo npm install -g @your-scope/project-name

# Option 2: Fix npm permissions (recommended)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Build Errors

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Node Version Issues

```bash
# Using nvm to switch Node versions
nvm install 20
nvm use 20
```

## Next Steps

- [Configuration Guide](02-CONFIGURATION.md)
- [API Reference](03-API.md)
