# Deployment Workflow Guide

## Overview

This project uses an optimized dual-deployment strategy:
- **Vercel** for client (frontend) deployment
- **Railway** for server (backend) deployment

## Deployment Strategy

### Automatic Deployments
- **Client changes** trigger Vercel rebuilds automatically
- **Server changes** trigger Railway deployments (after GitHub integration setup)
- **Shared changes** trigger both deployments (necessary)

### Smart Build Ignoring
Vercel will automatically skip builds when changes are server-only:
- Commit messages containing `server:`
- Commit messages containing `feat: implement Railway`
- Changes only affecting `server/`, `railway.toml`, or `docs/*.md`

## Setup Instructions

### Phase 1: Enable Railway GitHub Auto-Deployment

**⚠️ Manual Setup Required** - Complete these steps in Railway dashboard:

1. **Navigate to Railway Dashboard**
   ```bash
   railway login
   railway open
   ```

2. **Connect GitHub Repository**
   - Go to your project in Railway dashboard
   - Click "Settings" → "Service" 
   - Click "Connect Repo" or "GitHub Integration"
   - Select your repository: `over-optimized/switch-card-game`
   - Choose branch: `main`
   - Set root directory: `/` (monorepo root)

3. **Configure Auto-Deployment**
   - Enable "Auto-Deploy from GitHub"
   - Railway will use existing `railway.toml` configuration
   - Verify build command and start command are correct

### Phase 2: Vercel Configuration (Already Complete)
✅ Vercel path-based build ignoring configured in `vercel.json`

## Deployment Commands

### Manual Deployment (Fallback)
```bash
# Deploy server manually
railway up

# Check deployment status
railway status

# View server logs
railway logs
```

### Verification Commands
```bash
# Check Railway project status
railway status

# Test Vercel build ignoring (locally)
git log -1 --pretty=format:%s | grep -E "(server:|feat: implement Railway)"

# List recent deployments
railway deployments
```

## Deployment Scenarios

### Server-Only Changes
```bash
git commit -m "server: implement Railway trial optimizations"
git push origin main
```
**Result:** 
- ✅ Railway deploys automatically (after GitHub integration)
- 🚫 Vercel skips build (ignoreCommand detects server-only change)

### Client-Only Changes  
```bash
git commit -m "feat: update mobile UI components"  
git push origin main
```
**Result:**
- ✅ Vercel deploys client changes
- ⚡ Railway may deploy but builds quickly (no changes)

### Shared Changes
```bash
git commit -m "feat: update shared game engine logic"
git push origin main  
```
**Result:**
- ✅ Both services deploy (necessary for consistency)

## Troubleshooting

### Vercel Build Not Skipped
- Check commit message format (should contain `server:` for server-only)
- Verify `vercel.json` ignoreCommand syntax
- Test locally: `bash -c 'echo "$commit_message" | grep server'`

### Railway Not Auto-Deploying
- Verify GitHub integration in Railway dashboard
- Check Railway project is connected to correct repository/branch
- Ensure `railway.toml` configuration is valid

### Build Failures
- Check build logs in respective service dashboards
- Verify dependency versions and build commands
- Ensure shared package builds before dependent packages

## Production URLs

- **Client (Vercel):** https://switch-card-game.vercel.app
- **Server (Railway):** https://switch-server-production.up.railway.app
- **WebSocket:** wss://switch-server-production.up.railway.app

## Cost Optimization

This workflow optimizes resource usage:
- Prevents unnecessary Vercel rebuilds (saves build minutes)
- Railway auto-deployment reduces manual CLI usage
- Smart triggering reduces overall deployment overhead