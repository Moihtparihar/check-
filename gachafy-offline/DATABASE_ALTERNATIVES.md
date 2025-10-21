# Database Migration Guide

## Overview
GachaFi currently uses Supabase (PostgreSQL). This guide helps you migrate to alternative databases if needed.

## Current Supabase Usage

The app uses Supabase for:
1. **Authentication** - User login/signup (if implemented)
2. **Real-time subscriptions** - Live data updates (if used)
3. **Edge Functions** - Serverless backend logic (if used)
4. **Storage** - File uploads (if used)

**Current Implementation:** The app is configured but doesn't actively use Supabase database tables yet. It's primarily a frontend app with Web3 wallet integration.

## Alternative Backend Options

### Option 1: Continue with Supabase (Recommended)
**Pros:**
- Already configured
- Free tier generous
- Built-in auth, realtime, storage
- Easy to scale
- PostgreSQL compatible

**Cost:** Free up to 500MB DB, $25/mo for Pro

**Setup:** Already done! Just use it.

---

### Option 2: Firebase (Google)
**Best for:** Real-time features, mobile apps, fast prototyping

**Migration Steps:**
1. Install Firebase:
```bash
npm install firebase
```

2. Replace `src/integrations/supabase/client.ts` with:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

3. Update environment variables in `.env`

**Cost:** Free tier generous, pay-as-you-go after

---

### Option 3: MongoDB Atlas
**Best for:** Flexible schema, document storage, global distribution

**Migration Steps:**
1. Install MongoDB:
```bash
npm install mongodb
```

2. Create connection utility:
```typescript
// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI;
const client = new MongoClient(uri);

export async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(import.meta.env.VITE_MONGODB_DB);
}
```

3. Replace Supabase calls with MongoDB operations

**Cost:** Free tier 512MB, $9+/mo for dedicated

---

### Option 4: PlanetScale (MySQL)
**Best for:** Scalability, branching databases, serverless

**Migration Steps:**
1. Install Prisma (recommended ORM):
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Configure `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  address   String   @unique
  createdAt DateTime @default(now())
}
```

4. Generate client:
```bash
npx prisma generate
```

**Cost:** Free tier 5GB, $29+/mo for production

---

### Option 5: Self-Hosted PostgreSQL
**Best for:** Full control, compliance requirements, cost optimization

**Migration Steps:**
1. Set up PostgreSQL server (AWS RDS, DigitalOcean, etc.)

2. Install Prisma or pg:
```bash
npm install @prisma/client pg
```

3. Use Prisma (recommended) or native pg client:
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: import.meta.env.VITE_DATABASE_URL
    }
  }
});
```

**Cost:** $5-50+/mo depending on hosting

---

### Option 6: Serverless/Edge Databases

#### Cloudflare D1 (SQLite)
```bash
npm install @cloudflare/workers-types
```

#### Turso (Edge SQLite)
```bash
npm install @libsql/client
```

#### Neon (Serverless Postgres)
```bash
npm install @neondatabase/serverless
```

**Cost:** Most have generous free tiers

---

## Migration Checklist

When switching databases:

1. **Export Current Data** (if any)
```bash
# For Supabase
supabase db dump > backup.sql
```

2. **Update Environment Variables**
- Remove Supabase vars
- Add new database vars

3. **Update Client Files**
- Replace `src/integrations/supabase/client.ts`
- Update import statements across codebase

4. **Migrate Edge Functions** (if used)
- Rewrite as API routes or serverless functions
- Use Vercel Functions, Netlify Functions, or Cloudflare Workers

5. **Update Authentication** (if used)
- Implement new auth provider
- Migrate user accounts

6. **Test Thoroughly**
- All database operations
- Authentication flows
- Real-time features (if used)

7. **Update Documentation**
- Environment variables
- Setup instructions
- Deployment guide

---

## Current State: No Migration Needed

**Important:** Your current app doesn't actively use Supabase database tables. The main components are:

1. **Radix Wallet Integration** - Stays the same
2. **Frontend State** - React Context, no DB needed
3. **Offline Storage** - IndexedDB (browser-based)
4. **PWA Features** - Service Workers (browser-based)

**You can deploy immediately without any database!** 

Supabase is configured but optional. Keep it for future features like:
- User profiles
- Leaderboards
- Social features
- Analytics
- Capsule marketplace

---

## Recommendation

**Keep Supabase** because:
1. It's already configured
2. Free tier is generous
3. You'll likely need it for future features
4. Migration is unnecessary work
5. Easy to scale when needed

Focus on deploying to production first, optimize database later if needed.

---

## No-Database Deployment

If you want zero backend dependencies:

1. Remove Supabase from `.env`:
```bash
# Keep only:
VITE_RADIX_NETWORK=stokenet
VITE_RADIX_DAPP_DEFINITION=your-address
VITE_ONESIGNAL_APP_ID=optional
```

2. Comment out Supabase imports (not breaking anything currently)

3. Deploy as pure static site

**Limitations:**
- No server-side features
- No user authentication
- No data persistence across devices
- No analytics/tracking backend

**This works fine for:**
- Demo/MVP
- Client-only apps
- Web3-native apps (blockchain is the backend)
