# Deployment Workflow Guide

[![CI Pipeline](https://github.com/over-optimized/switch-card-game/actions/workflows/ci.yml/badge.svg)](https://github.com/over-optimized/switch-card-game/actions/workflows/ci.yml)

## Overview

This project uses an optimized CI/CD pipeline with dual-deployment strategy:
- **GitHub Actions** for automated quality gates and validation
- **Vercel** for client (frontend) deployment
- **Railway** for server (backend) deployment

## Quality Gates (CI Pipeline)

**All deployments are blocked until these pass:**
- ✅ **Lint checks** - ESLint validation for all packages
- ✅ **Type checks** - TypeScript strict mode validation
- ✅ **Unit tests** - Test suite with coverage thresholds
- ✅ **Build validation** - All packages must build successfully

**CI Command:** `pnpm ci` (runs lint:all + test + build)

## Deployment Strategy

### Automatic Deployments
- **Client changes** trigger Vercel rebuilds automatically
- **Server changes** trigger Railway deployments (after GitHub integration setup)
- **Shared changes** trigger both deployments (necessary)

### Smart Build Ignoring
Vercel will automatically skip builds when changes are server/infrastructure-only:

**Skip Triggers (Commit Messages):**
- Contains `server:` - Server-only changes
- Contains `Railway` - Railway deployment changes  
- Contains `CI/CD` - CI/CD pipeline changes
- Contains `GitHub Actions` - Workflow changes

**Skip Triggers (File Changes):**
- Only files in: `server/`, `railway.toml`, `.github/`, `docs/`
- AND no files in: `client/`, `shared/`, `vercel.json`

**Note:** Skipped builds may show as "failed" in Vercel dashboard - this is expected behavior for intentionally ignored deployments.

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

### Vercel "Failed" Deployments for Skipped Builds
**Expected Behavior:** Infrastructure changes (CI/CD, server, docs) will show as "failed" in Vercel dashboard.

**Why This Happens:**
1. Vercel detects git push and starts deployment process
2. `ignoreCommand` evaluates and detects server-only changes  
3. Build is intentionally cancelled (exit code 1)
4. Vercel logs this as "failed" but it's actually working correctly

**How to Verify It's Working:**
- Check deployment logs for: `🚫 Skipping Vercel build - server/infra only changes`
- No actual build errors in the logs
- Production site remains unchanged (expected)

### Vercel Build Not Skipped When Expected
- Check commit message patterns: `server:`, `Railway`, `CI/CD`, `GitHub Actions`
- Verify file changes: only `server/`, `.github/`, `docs/`, `railway.toml`
- If `client/`, `shared/`, or `vercel.json` changed, build will proceed (correct)

### Railway Not Auto-Deploying
- Verify GitHub integration in Railway dashboard
- Check Railway project is connected to correct repository/branch
- Ensure `railway.toml` configuration is valid

### Actual Build Failures
- Check build logs for compilation errors
- Verify dependency versions and build commands
- Ensure shared package builds before dependent packages
- Run `pnpm ci` locally to catch issues before push

## Production URLs

- **Client (Vercel):** https://switch-card-game.vercel.app
- **Server (Railway):** https://switch-server-production.up.railway.app
- **WebSocket:** wss://switch-server-production.up.railway.app

## Cost Optimization

This workflow optimizes resource usage:
- Prevents unnecessary Vercel rebuilds (saves build minutes)
- Railway auto-deployment reduces manual CLI usage
- Smart triggering reduces overall deployment overhead