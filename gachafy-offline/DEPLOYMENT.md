# Quick Deployment Guide

## Prerequisites
1. Node.js 18+ installed
2. Supabase project created
3. Environment variables configured

## Quick Start (5 minutes)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd gachafi
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Deploy to Vercel (Easiest)
```bash
npm i -g vercel
vercel
```
Then add environment variables in Vercel dashboard.

### 3. Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### 4. Deploy with Docker
```bash
docker-compose up -d
```

## Environment Variables Needed

**Required:**
- `VITE_SUPABASE_URL` - From Supabase dashboard
- `VITE_SUPABASE_PUBLISHABLE_KEY` - From Supabase dashboard
- `VITE_SUPABASE_PROJECT_ID` - From Supabase URL

**Optional:**
- `VITE_ONESIGNAL_APP_ID` - For push notifications
- `VITE_RADIX_NETWORK` - Default: stokenet
- `VITE_RADIX_DAPP_DEFINITION` - Your dApp address

## Platform-Specific Instructions

### Vercel
1. Import GitHub repo at vercel.com
2. Add environment variables
3. Deploy

### Netlify
1. Import GitHub repo at netlify.com
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy

### AWS Amplify
1. Connect GitHub repo
2. Build settings: Detected automatically
3. Add environment variables
4. Deploy

### Cloudflare Pages
1. Connect GitHub repo
2. Build command: `npm run build`
3. Build output: `dist`
4. Add environment variables
5. Deploy

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy (automatic)

### Render
1. New Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy

## Post-Deployment Checklist

- [ ] Test wallet connection
- [ ] Test gacha opening
- [ ] Test offline functionality
- [ ] Verify push notifications (if enabled)
- [ ] Check all routes load correctly
- [ ] Test on mobile devices
- [ ] Review error logs
- [ ] Set up monitoring

## Troubleshooting

**Build fails:**
- Ensure all environment variables are set
- Check Node.js version is 18+

**Blank page:**
- Check browser console for errors
- Verify environment variables are correct
- Check Supabase project is not paused

**Can't connect wallet:**
- Ensure Radix Connector extension is installed
- Verify dApp definition address is correct

## Support

See `README.production.md` for detailed documentation.
