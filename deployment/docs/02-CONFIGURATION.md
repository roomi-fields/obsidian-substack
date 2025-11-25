# Configuration Guide

## Environment Variables

All configuration is done through environment variables. Create a `.env` file in the project root.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `info` |

## Configuration File

### .env Template

```bash
# Environment
NODE_ENV=production

# Server
PORT=3000

# Logging
LOG_LEVEL=info

# Add your configuration here
```

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
PORT=8080
```

### Test

```bash
NODE_ENV=test
LOG_LEVEL=error
PORT=3001
```

## Advanced Configuration

### Logging Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| `debug` | Detailed debug info | Development |
| `info` | General information | Default |
| `warn` | Warning messages | Production |
| `error` | Error messages only | Minimal logging |

### PM2 Configuration

The `ecosystem.config.cjs` file configures PM2 daemon mode:

```javascript
module.exports = {
  apps: [{
    name: 'project-name',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Validation

Configuration is validated at startup. Invalid configuration will prevent the application from starting.

### Common Validation Errors

```
Invalid environment configuration:
- PORT: Expected number, received string
```

**Solution**: Ensure all required variables are set with correct types.

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong secrets** in production
3. **Limit log verbosity** in production
4. **Rotate secrets** regularly

## Next Steps

- [API Reference](03-API.md)
- [Troubleshooting](04-TROUBLESHOOTING.md)
