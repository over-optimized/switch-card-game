# Railway Deployment Guide

This guide covers deploying the Switch Card Game server to Railway.

## Prerequisites

1. Railway account: https://railway.app
2. Railway CLI installed: `npm install -g @railway/cli`
3. Git repository with latest changes pushed

## Deployment Steps

### 1. Login to Railway CLI

```bash
railway login
```

### 2. Create a new Railway project

```bash
# From the root directory
railway init

# Follow the prompts:
# - Select "Empty Project"
# - Name it "switch-card-game-server"
```

### 3. Deploy to Railway

```bash
# Deploy the current branch
railway up

# The deployment will:
# 1. Install dependencies with pnpm
# 2. Build the shared package
# 3. Build the server package
# 4. Start the server with production config
```

### 4. Configure Environment Variables

In the Railway dashboard:

1. Go to your project
2. Click on "Variables" tab
3. Add these variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://switch-card-game.vercel.app`

### 5. Get Your Server URL

After deployment, Railway will provide a URL like:
`https://switch-card-game-server.railway.app`

### 6. Update Client Environment

Update `client/.env.production` with your Railway URL:

```env
VITE_SERVER_URL=https://your-app-name.railway.app
VITE_WS_URL=https://your-app-name.railway.app
```

Then redeploy your frontend to Vercel.

## Monorepo Configuration

The deployment is configured with:

- **railway.toml**: Railway-specific configuration
- **nixpacks.toml**: Build configuration for monorepo
- **.railwayignore**: Excludes unnecessary files

## Environment Variables

### Server (Railway)
- `NODE_ENV=production`
- `CLIENT_URL=https://switch-card-game.vercel.app`
- `PORT=3001` (auto-set by Railway)

### Client (Vercel)
- `VITE_WS_URL=https://your-railway-app.railway.app`

## Testing Deployment

1. Visit your Railway app URL + `/health`
2. Should return server status and environment info
3. Test WebSocket connection from your Vercel frontend

## Troubleshooting

### Build Fails
- Check Railway logs: `railway logs`
- Ensure pnpm workspace configuration is correct
- Verify shared package builds successfully

### Connection Issues
- Check CORS origins in server/src/index.ts
- Verify CLIENT_URL environment variable
- Test health endpoint first

### WebSocket Fails
- Ensure Railway app supports WebSocket connections (it does)
- Check browser console for connection errors
- Verify client is using correct WSS URLs (https should use wss)

## Manual Deployment Commands

If automatic deployment fails:

```bash
# Build locally first
pnpm --filter switch-shared run build:prod
pnpm --filter switch-server run build:prod

# Then deploy
railway up
```