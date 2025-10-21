# GachaFi - Production Deployment Guide

## Overview
GachaFi is a production-ready Web3 gacha gaming application with offline-first capabilities, built with React, Vite, Radix DLT, and Supabase.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Radix DLT (Stokenet/Mainnet)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **PWA**: Service Workers + IndexedDB

## Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Radix wallet (for testing)
- (Optional) OneSignal account for push notifications

## Local Development Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd gachafi
npm install  # or: bun install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- **Supabase**: Get from https://supabase.com/dashboard/project/_/settings/api
- **OneSignal** (optional): Get from https://onesignal.com/

### 3. Supabase Setup
Your Supabase project is already configured with the project ID: `ibicvmavajmuoygedeyw`

**Important**: Ensure your Supabase RLS policies are properly configured for production use.

### 4. Run Development Server
```bash
npm run dev  # or: bun run dev
```

Access at `http://localhost:5173`

## Production Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Vercel Configuration** (automatic with `vite.config.ts`)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Netlify Configuration**: Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Docker
```bash
# Build image
docker build -t gachafi:latest .

# Run container
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your-key \
  gachafi:latest
```

### Option 4: Static Hosting (AWS S3, CloudFlare Pages, etc.)
```bash
# Build
npm run build

# Upload 'dist' folder to your hosting provider
```

## Environment Variables

### Required
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID

### Optional
- `VITE_ONESIGNAL_APP_ID`: OneSignal app ID for push notifications
- `VITE_RADIX_NETWORK`: `stokenet` (testnet) or `mainnet`
- `VITE_RADIX_DAPP_DEFINITION`: Your dApp definition address

## Supabase Edge Functions

Edge functions are located in `supabase/functions/`. They deploy automatically with Supabase CLI.

**Local Testing**:
```bash
supabase functions serve
```

**Production Deployment**:
```bash
supabase functions deploy
```

## Security Checklist

- [ ] Enable RLS on all Supabase tables
- [ ] Review and test all RLS policies
- [ ] Set up proper CORS headers for production domain
- [ ] Configure CSP headers
- [ ] Enable rate limiting on Supabase
- [ ] Review and rotate API keys regularly
- [ ] Set up monitoring and error tracking (Sentry recommended)
- [ ] Enable HTTPS only
- [ ] Configure proper authentication flows
- [ ] Review sensitive data logging (already sanitized in code)

## Performance Optimizations

### Already Implemented
- ✅ Code splitting with React lazy loading
- ✅ Image optimization
- ✅ Service worker caching (PWA)
- ✅ IndexedDB for offline storage
- ✅ TanStack Query caching
- ✅ Debounced API calls
- ✅ Rate limiting

### Additional Recommendations
- Enable CDN for static assets
- Configure gzip/brotli compression
- Set up proper cache headers
- Use image CDN (Cloudflare Images, Imgix, etc.)
- Monitor Core Web Vitals

## Monitoring & Logging

### Recommended Services
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Plausible, Google Analytics
- **Performance**: Lighthouse CI, WebPageTest
- **Uptime**: UptimeRobot, Pingdom

### Built-in Logging
The app includes a production-safe logging system (`src/lib/logger.ts`) that:
- Sanitizes sensitive data
- Only logs errors/warnings in production
- Buffers recent logs for debugging

## Database Migrations

Supabase migrations are in `supabase/migrations/`. 

**To apply migrations**:
```bash
# Local
supabase db push

# Production (via Supabase dashboard or CLI)
supabase db push --linked
```

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is not paused
- Verify RLS policies allow your operations
- Check network/CORS settings

### Wallet Connection Issues
- Ensure Radix Connector browser extension is installed
- Verify dApp definition address is correct
- Check network (Stokenet vs Mainnet) matches

### Service Worker Issues
```bash
# Unregister all service workers in browser DevTools:
# Application tab > Service Workers > Unregister
```

## CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Scaling Considerations

### Current Capacity
- Frontend: Scales infinitely (static hosting)
- Supabase Free Tier: 500MB database, 2GB bandwidth/month
- Supabase Pro: Unlimited with usage-based pricing

### When to Scale
- **Database**: Upgrade Supabase tier when approaching 500MB
- **Edge Functions**: Monitor execution time and memory
- **Real-time**: Supabase supports millions of concurrent connections

### Rate Limits (Built-in)
- Wallet connections: 3/minute
- Mints: 5/minute per wallet
- Balance checks: Debounced to 5s intervals

## Support & Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Review Supabase usage monthly
- [ ] Update dependencies monthly (`npm outdated`)
- [ ] Security audit quarterly
- [ ] Performance audit quarterly
- [ ] Backup database weekly (automatic with Supabase)

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update non-breaking
npm update

# Update major versions (test thoroughly)
npm install package@latest
```

## License
[Your License Here]

## Contact
[Your Contact Information]
