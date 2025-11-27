# Troubleshooting Guide

## Common Issues

### Application Won't Start

#### Symptom

Application fails to start with configuration errors.

#### Solution

1. Verify `.env` file exists
2. Check all required variables are set
3. Validate variable types

```bash
# Check .env file
cat .env

# Verify Node version
node --version
```

---

### Port Already in Use

#### Symptom

```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solution

1. Find the process using the port:

   ```bash
   # Linux/macOS
   lsof -i :3000

   # Windows
   netstat -ano | findstr :3000
   ```

2. Kill the process or use a different port:
   ```bash
   # Change port in .env
   PORT=3001
   ```

---

### Build Errors

#### Symptom

TypeScript compilation fails.

#### Solution

1. Clear build artifacts:

   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. Check TypeScript version:
   ```bash
   npx tsc --version
   ```

---

### PM2 Issues

#### Symptom

PM2 daemon not starting or crashing.

#### Solution

1. Check PM2 logs:

   ```bash
   npm run daemon:logs
   # or
   pm2 logs project-name
   ```

2. Check status:

   ```bash
   pm2 status
   ```

3. Restart PM2:

   ```bash
   pm2 delete all
   npm run daemon:start
   ```

4. Check memory usage:
   ```bash
   pm2 monit
   ```

---

### Connection Refused

#### Symptom

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

#### Solution

1. Verify the application is running:

   ```bash
   pm2 status
   # or
   ps aux | grep node
   ```

2. Check the port configuration:

   ```bash
   echo $PORT
   ```

3. Test locally:
   ```bash
   curl http://localhost:3000/health
   ```

---

### Out of Memory

#### Symptom

Application crashes with memory errors.

#### Solution

1. Increase Node memory limit:

   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

2. Update PM2 memory limit in `ecosystem.config.cjs`:
   ```javascript
   max_memory_restart: "2G";
   ```

---

### Permission Errors

#### Symptom

```
Error: EACCES: permission denied
```

#### Solution

1. Check file permissions:

   ```bash
   ls -la
   ```

2. Fix ownership:

   ```bash
   sudo chown -R $USER:$USER .
   ```

3. For npm global installs:
   ```bash
   npm config set prefix ~/.npm-global
   ```

---

## Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=debug npm start
```

### Check Application Logs

```bash
# PM2 logs
pm2 logs project-name --lines 100

# Log files
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

### Test Endpoints

```bash
# Health check
curl -v http://localhost:3000/health

# With headers
curl -v -H "Content-Type: application/json" http://localhost:3000/api/endpoint
```

## Performance Issues

### Slow Response Times

1. Check resource usage:

   ```bash
   pm2 monit
   ```

2. Enable debug logging to identify bottlenecks

3. Profile the application:
   ```bash
   node --inspect dist/index.js
   ```

### High CPU Usage

1. Check for infinite loops in logs
2. Monitor with PM2:
   ```bash
   pm2 monit
   ```

## Getting Help

If none of the above solutions work:

1. **Check GitHub Issues**: Search for similar problems
2. **Create an Issue**: Include:
   - Node.js version
   - OS and version
   - Error messages
   - Steps to reproduce
3. **Enable Debug Logging**: Attach relevant logs

## Useful Commands Reference

```bash
# Check Node version
node --version

# Check npm version
npm --version

# View all environment variables
printenv | grep -E "NODE|PORT|LOG"

# Test connectivity
curl -v http://localhost:3000/health

# View PM2 status
pm2 status

# View PM2 logs
pm2 logs --lines 50

# Restart PM2 application
pm2 restart project-name

# Kill all PM2 processes
pm2 kill
```
