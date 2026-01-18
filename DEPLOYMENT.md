# Deployment Guide - Madadgaar Expert Partner

This guide covers deploying the Madadgaar Expert Partner frontend to various hosting platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [cPanel/VPS Deployment](#cpanelvps-deployment)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 14+ installed locally
- ✅ Git repository set up
- ✅ All environment variables configured
- ✅ Backend API URL ready
- ✅ Domain name (if using custom domain)

---

## Environment Variables

### Required Variables

Create these environment variables in your hosting platform:

```env
REACT_APP_API_URL=https://api.madadgaar.com.pk
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SITE_URL=https://madadgaar.com.pk
```

### Optional Variables

```env
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_CONTACT_EMAIL=support@madadgaar.com.pk
REACT_APP_CONTACT_PHONE=+923071113330
```

---

## Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "madagaar-frontend"

3. **Configure Project**
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from your `.env` file
   - Apply to: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at: `your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Add Environment Variables via CLI**
   ```bash
   vercel env add REACT_APP_API_URL production
   vercel env add REACT_APP_GOOGLE_ANALYTICS_ID production
   ```

### Important Notes for Vercel

- ✅ `.npmrc` file is included with `legacy-peer-deps=true` for React 19 compatibility
- ✅ `vercel.json` is configured with proper routes for SPA
- ✅ All static files are cached for optimal performance
- ✅ Automatic HTTPS is enabled

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain: `madadgaar.com.pk`
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Netlify Deployment

### Method 1: Git Integration

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select repository

3. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: build
   ```

4. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required variables

5. **Deploy Site**

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   # Draft deploy
   netlify deploy
   
   # Production deploy
   netlify deploy --prod
   ```

### Netlify Redirects

Create `public/_redirects`:
```
/*    /index.html   200
```

---

## cPanel/VPS Deployment

### Step 1: Build Locally

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

### Step 2: Upload to Server

**Via FTP/SFTP:**
1. Connect to your server
2. Navigate to `public_html` or your web root
3. Upload contents of `build` folder

**Via SSH:**
```bash
# Zip build folder
zip -r build.zip build/

# Upload to server
scp build.zip user@your-server.com:/path/to/webroot/

# SSH into server
ssh user@your-server.com

# Extract files
unzip build.zip
mv build/* .
rm -rf build build.zip
```

### Step 3: Configure Apache

Create/update `.htaccess` in web root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect HTTP to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Handle React Router
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

### Step 4: Configure Nginx (if using Nginx)

```nginx
server {
    listen 80;
    server_name madadgaar.com.pk www.madadgaar.com.pk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name madadgaar.com.pk www.madadgaar.com.pk;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    root /var/www/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in root:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=https://api.madadgaar.com.pk
      - REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t madagaar-frontend .

# Run container
docker run -p 3000:80 madagaar-frontend

# Or use docker-compose
docker-compose up -d
```

---

## Troubleshooting

### Issue: React Helmet Async Dependency Error

**Error:** `ERESOLVE could not resolve` with react-helmet-async

**Solution:**
- Ensure `.npmrc` file exists with `legacy-peer-deps=true`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Issue: Build Fails on Vercel

**Solutions:**
1. Check build logs for specific errors
2. Verify all environment variables are set
3. Ensure `.npmrc` is committed to repository
4. Check Node.js version compatibility
5. Clear Vercel cache and redeploy

### Issue: Routing Not Working (404 on Refresh)

**Solutions:**

**Vercel:** Check `vercel.json` routes configuration

**Netlify:** Add `_redirects` file to public folder

**Apache:** Ensure `.htaccess` has proper rewrite rules

**Nginx:** Configure `try_files` directive

### Issue: API Calls Failing

**Check:**
1. Environment variables are set correctly
2. API URL doesn't have trailing slash
3. CORS is configured on backend
4. SSL certificate is valid
5. API is accessible from deployment server

### Issue: Images Not Loading

**Solutions:**
1. Check image paths (use `/Media/image.png` not `Media/image.png`)
2. Ensure images are in `public` folder
3. Verify case sensitivity on Linux servers
4. Check file permissions on server

### Issue: Slow Loading

**Optimizations:**
1. Enable gzip compression
2. Configure CDN (Cloudflare)
3. Optimize images (WebP format)
4. Enable browser caching
5. Use lazy loading for images
6. Code splitting for routes

---

## Post-Deployment Checklist

- [ ] Site is accessible via domain
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] API integration working
- [ ] Images loading properly
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Analytics tracking working
- [ ] SSL certificate valid
- [ ] Performance score good (Lighthouse)
- [ ] No console errors
- [ ] 404 page working
- [ ] Social media cards working

---

## Monitoring & Maintenance

### Performance Monitoring

- **Google Analytics**: Track user behavior
- **Vercel Analytics**: Monitor Core Web Vitals
- **Lighthouse**: Regular performance audits
- **GTmetrix**: Speed and optimization metrics

### Regular Tasks

- Update dependencies monthly
- Review error logs weekly
- Check SSL certificate expiry
- Monitor API response times
- Review Google Search Console
- Update sitemap.xml when adding pages
- Backup database regularly

---

## Support

For deployment issues:
- Email: developer@madadgaar.com.pk
- Developer: Abubakkar Sajid (abubakkarsajid4@gmail.com)

For general inquiries:
- Email: support@madadgaar.com.pk
- Phone: +92 307 111 333 0

---

**Last Updated:** January 2026
**Version:** 0.1.0
