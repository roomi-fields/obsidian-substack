# Deployment Documentation

This directory contains deployment guides and scripts for the project.

## Structure

```
deployment/
├── README.md           # This file
├── docs/               # Detailed documentation
│   ├── 01-INSTALL.md       # Installation guide
│   ├── 02-CONFIGURATION.md # Configuration options
│   ├── 03-API.md           # API reference
│   └── 04-TROUBLESHOOTING.md # Common issues
└── scripts/            # Deployment scripts
    ├── install.ps1         # Installation script
    ├── start.ps1           # Start server
    ├── stop.ps1            # Stop server
    └── test.ps1            # Test endpoints
```

## Quick Start

### 1. Installation

```bash
npm install @your-scope/project-name
```

Or run the installation script:

```powershell
.\deployment\scripts\install.ps1
```

### 2. Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your settings.

### 3. Start the Application

```bash
npm start
```

Or use the daemon mode:

```bash
npm run daemon:start
```

### 4. Verify

```bash
curl http://localhost:3000/health
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [Installation](docs/01-INSTALL.md) | Complete installation guide |
| [Configuration](docs/02-CONFIGURATION.md) | Configuration options |
| [API Reference](docs/03-API.md) | API endpoints and usage |
| [Troubleshooting](docs/04-TROUBLESHOOTING.md) | Common issues and solutions |

## Deployment Options

### Local Development

```bash
npm run dev
```

### Production (PM2)

```bash
npm run daemon:start
npm run daemon:status
npm run daemon:logs
```

### Docker (if applicable)

```bash
docker build -t project-name .
docker run -p 3000:3000 project-name
```

## Support

For issues, check [Troubleshooting](docs/04-TROUBLESHOOTING.md) or open a GitHub issue.
