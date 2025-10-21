# Self-Hosting Guide - Complete Independence

This guide shows how to run GachaFi with **zero third-party dependencies** - completely self-hosted on your own infrastructure.

## Architecture Options

### Option 1: Pure Static (Simplest)
```
┌─────────────┐
│  Your VPS   │
│  + Nginx    │ ← Serves built React app
│  + SSL      │ ← Free Let's Encrypt
└─────────────┘
```
**Cost**: $5/month (DigitalOcean, Hetzner, Vultr)

### Option 2: With Database
```
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│  PostgreSQL  │
│  (Nginx)    │     │  (Docker)    │
└─────────────┘     └──────────────┘
```
**Cost**: $10/month (1 VPS with Docker)

### Option 3: Full Stack
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Backend API │────▶│  Database   │
│  (Nginx)    │     │  (Node.js)   │     │  (Postgres) │
└─────────────┘     └──────────────┘     └─────────────┘
```
**Cost**: $15-30/month (Separate servers or Docker Compose)

## Quick Start: Pure Static Hosting

### Step 1: Get a VPS
```bash
# Providers (cheapest to expensive):
# - Hetzner Cloud: €3.79/month (2GB RAM)
# - DigitalOcean: $6/month (1GB RAM)
# - Vultr: $6/month (1GB RAM)
# - Linode: $5/month (1GB RAM)
```

### Step 2: Initial Server Setup
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install nginx, certbot, nodejs
apt install -y nginx certbot python3-certbot-nginx nodejs npm

# Create app directory
mkdir -p /var/www/gachafi
chown -R $USER:$USER /var/www/gachafi
```

### Step 3: Build & Deploy App
```bash
# On your local machine
git clone <your-repo>
cd gachafi

# Configure for production
cp .env.example .env.production
# Edit .env.production (can leave Supabase empty for pure static)

# Build
npm install
npm run build

# Upload to VPS
scp -r dist/* root@your-vps-ip:/var/www/gachafi/
```

### Step 4: Configure Nginx
```bash
# On VPS, create config
nano /etc/nginx/sites-available/gachafi
```

Paste this:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/gachafi;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/gachafi /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5: Get Free SSL
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts, choose redirect HTTP to HTTPS
```

### Step 6: Setup Auto-Renewal
```bash
# Test renewal
certbot renew --dry-run

# Auto-renewal is already set up by certbot
# Check with: systemctl list-timers | grep certbot
```

**Done! Your app is now running at https://yourdomain.com**

## Advanced: Self-Hosted Database

### Docker Compose Setup
Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  # Frontend
  app:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - postgres
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gachafi
      POSTGRES_USER: gachafi_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gachafi_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backup service
  backup:
    image: postgres:15-alpine
    depends_on:
      - postgres
    environment:
      PGHOST: postgres
      PGDATABASE: gachafi
      PGUSER: gachafi_user
      PGPASSWORD: ${DB_PASSWORD}
    volumes:
      - ./backups:/backups
    entrypoint: |
      sh -c 'while true; do
        pg_dump -h postgres -U gachafi_user gachafi > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
        find /backups -name "backup_*.sql" -mtime +7 -delete
        sleep 86400
      done'
    restart: unless-stopped

volumes:
  pgdata:
```

Deploy:
```bash
# On VPS
export DB_PASSWORD="your-secure-password"
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose logs -f
```

## Monitoring & Maintenance

### Setup Monitoring
```bash
# Install monitoring tools
apt install -y htop nethogs iotop

# Monitor nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Monitor system resources
htop
```

### Automated Backups
```bash
# Create backup script
nano /root/backup-gachafi.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup website
tar -czf $BACKUP_DIR/gachafi_web_$DATE.tar.gz /var/www/gachafi

# Backup database (if using Docker Compose)
docker exec gachafi_postgres_1 pg_dump -U gachafi_user gachafi > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

# Upload to cloud (optional)
# rclone copy $BACKUP_DIR remote:backups/gachafi
```

```bash
chmod +x /root/backup-gachafi.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /root/backup-gachafi.sh
```

### Firewall Setup
```bash
# Install UFW
apt install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow ssh
ufw allow http
ufw allow https

# Enable firewall
ufw enable
```

## Cost Comparison: Self-Hosted vs Services

| Approach | Monthly Cost | Setup Time | Maintenance |
|----------|--------------|------------|-------------|
| **Pure Static Self-Hosted** | $5 | 30 min | 1 hr/month |
| **Vercel/Netlify** | $0-20 | 5 min | None |
| **Self-Hosted + DB** | $10 | 2 hours | 2 hrs/month |
| **Supabase** | $0-25 | 10 min | None |
| **Full Self-Hosted Stack** | $15-30 | 4 hours | 3 hrs/month |

## Performance Tuning

### Nginx Caching
```nginx
# Add to nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

server {
    # ... existing config

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 365d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Enable HTTP/2
```nginx
server {
    listen 443 ssl http2;  # Add http2
    # ... rest of config
}
```

### Optimize PostgreSQL (if using)
```bash
# Edit postgresql.conf
nano /var/lib/postgresql/data/postgresql.conf
```

```ini
# Performance tuning for 2GB RAM VPS
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5242kB
min_wal_size = 1GB
max_wal_size = 4GB
```

## Troubleshooting

### App Not Loading
```bash
# Check nginx status
systemctl status nginx

# Check nginx config
nginx -t

# Check logs
tail -f /var/log/nginx/error.log
```

### SSL Issues
```bash
# Renew certificate
certbot renew

# Check certificate
certbot certificates
```

### Database Connection Issues (if using)
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs gachafi_postgres_1

# Connect to database
docker exec -it gachafi_postgres_1 psql -U gachafi_user -d gachafi
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean old logs
journalctl --vacuum-time=7d

# Clean Docker
docker system prune -a

# Clean old backups
find /root/backups -mtime +30 -delete
```

## Scaling Self-Hosted Setup

### When to Scale
- **>10k users**: Consider load balancer
- **>100k users**: Multiple app servers
- **>1M users**: CDN + distributed database

### Add CDN
```bash
# Use Cloudflare (free)
# 1. Point domain to Cloudflare
# 2. Enable proxy (orange cloud)
# 3. Configure SSL/TLS to "Full"
# 4. Enable caching rules
```

### Load Balancer
```nginx
# nginx load balancer config
upstream backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

## Alternative: Self-Hosted PaaS

If you want ease of managed services but on your own server:

### Coolify (Free, Self-Hosted)
```bash
# Install Coolify on your VPS
curl -fsSL https://get.coolify.io | bash

# Access at http://your-vps-ip:8000
# Deploy GachaFi with one click
```

### CapRover (Free, Self-Hosted)
```bash
# Install CapRover
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover

# Deploy via web UI
```

## The Bottom Line

**Pure Static Self-Hosting**: $5/month, full control  
**Managed Services**: $0-50/month, zero maintenance  
**Hybrid**: Use CDN + self-host database, best of both worlds

Your app works **anywhere** - the choice is yours!
