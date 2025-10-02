# Cache Management Guide

## Overview

This application now includes comprehensive cache management to ensure the latest version is always displayed in production. The following measures have been implemented:

## 1. Cache Control Headers

### HTML Pages (No Cache)
All HTML pages are served with these headers to prevent caching:
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`

### Static Assets (Short Cache)
CSS, JS, and images are cached for **1 hour** instead of 1 year:
- `Cache-Control: public, max-age=3600`

### Cache Busting
All CSS and JS files include a version query parameter that changes on cache clear:
- `/static/css/styles.css?v={timestamp}`
- `/static/js/main.js?v={timestamp}`

## 2. Admin Cache Management UI

Access the admin panel at `/admin` or `admin.yourdomain.com` to use cache management features:

### Clear Cache Button
- Updates the version number for all static assets
- Forces browsers to reload CSS and JS files
- No server restart required

### Restart Server Button
- Fully restarts the Node.js process
- Clears all server-side caches
- Requires PM2 to automatically restart the server

## 3. Manual Cache Clearing Methods

### Method 1: Using PM2 (Recommended)
```bash
# Restart the application
pm2 restart bitjr-website

# Or restart all PM2 processes
pm2 restart all
```

### Method 2: Using the Admin API
```bash
# Clear cache (update version)
curl -X POST http://localhost:3000/api/admin/clear-cache

# Restart server
curl -X POST http://localhost:3000/api/admin/restart-server
```

### Method 3: Reload Nginx Configuration
```bash
# After updating nginx-site.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Nginx Configuration

The `nginx-site.conf` file has been updated with:

1. **Reduced cache times** (1 hour instead of 1 year)
2. **Support for cache-busting** via query parameters
3. **Proper cache headers** for all content types

To apply nginx changes:
```bash
# Copy the updated config
sudo cp nginx-site.conf /etc/nginx/sites-available/bitjr

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 5. Deployment Workflow

When deploying new changes to production:

1. **Pull latest code:**
   ```bash
   cd /var/www/bitjr
   git pull origin main
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Restart the application:**
   ```bash
   pm2 restart bitjr-website
   ```

4. **Clear browser cache (users):**
   - Admins can click "Clear Cache" in the admin panel
   - Or users can hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

## 6. Troubleshooting

### Site Still Shows Old Version

**Solution 1: Clear Cache via Admin Panel**
1. Go to `/admin`
2. Click "Clear Cache"
3. Wait 3 seconds
4. Refresh the site

**Solution 2: Restart Server**
1. SSH into server
2. Run: `pm2 restart bitjr-website`
3. Wait 5 seconds
4. Refresh the site

**Solution 3: Hard Refresh in Browser**
- Chrome/Firefox: `Ctrl+Shift+R` or `Ctrl+F5`
- Safari: `Cmd+Option+R`
- Or open in incognito/private mode

**Solution 4: Clear Nginx Cache**
```bash
# If nginx proxy caching is enabled
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

### Version Not Updating

Check the version number in the HTML source:
```html
<link rel="stylesheet" href="/static/css/styles.css?v=1234567890">
```

If the version number (`v=...`) is the same, the cache clear didn't work. Try:
1. Restart the server via PM2
2. Check that the server is running: `pm2 status`
3. Check server logs: `pm2 logs bitjr-website`

## 7. Best Practices

1. **After Code Changes:** Always restart the server with PM2
2. **After Content Updates:** Use the "Clear Cache" button in admin
3. **After Nginx Config Changes:** Reload nginx
4. **For Testing:** Use incognito mode or hard refresh
5. **Monitor:** Check PM2 logs regularly: `pm2 logs bitjr-website`

## 8. PM2 Setup (If Not Already Configured)

If PM2 isn't set up yet:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
cd /var/www/bitjr
pm2 start src/server.js --name bitjr-website

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## 9. Environment Variables

Ensure `.env` file exists with:
```env
PORT=3000
SESSION_SECRET=your-secure-random-secret-here
NODE_ENV=production
```

## 10. Monitoring

Check application status:
```bash
# View status
pm2 status

# View logs
pm2 logs bitjr-website

# View real-time logs
pm2 logs bitjr-website --lines 50
```

---

## Quick Reference

| Action | Command/Location |
|--------|-----------------|
| Clear cache (UI) | `/admin` → Click "Clear Cache" |
| Restart server (UI) | `/admin` → Click "Restart Server" |
| Restart via CLI | `pm2 restart bitjr-website` |
| View logs | `pm2 logs bitjr-website` |
| Hard refresh | `Ctrl+F5` or `Cmd+Shift+R` |
| Check nginx | `sudo nginx -t` |
| Reload nginx | `sudo systemctl reload nginx` |

