# Deployment Checklist - Cache Management Update

## ✅ What Was Implemented

### 1. Server-Side Cache Control (`src/server.js`)
- ✅ Added cache headers middleware to prevent HTML caching
- ✅ Configured static file caching (1 hour instead of 1 year)
- ✅ Added version number to site object for cache busting
- ✅ Created `/api/admin/clear-cache` endpoint
- ✅ Created `/api/admin/restart-server` endpoint

### 2. Nginx Configuration (`nginx-site.conf`)
- ✅ Reduced cache time from 1 year to 1 hour
- ✅ Added support for cache-busting query parameters
- ✅ Applied to both main and admin subdomains

### 3. Frontend Cache Busting (`views/partials/layout.ejs`)
- ✅ Added version query parameter to CSS includes
- ✅ Added version query parameter to JS includes

### 4. Admin UI (`views/admin/index.ejs`)
- ✅ Added "Cache Management" card to admin dashboard
- ✅ Created "Clear Cache" button with API integration
- ✅ Created "Restart Server" button with confirmation
- ✅ Added user feedback messages

### 5. Documentation
- ✅ Created `CACHE-MANAGEMENT.md` with comprehensive guide
- ✅ Created this deployment checklist

## 📋 Deployment Steps

### Step 1: Update Server Files
```bash
# SSH into production server
ssh your-server

# Navigate to project directory
cd /var/www/bitjr

# Pull latest changes
git pull origin main

# Install any new dependencies (if needed)
npm install
```

### Step 2: Update Nginx Configuration
```bash
# Backup current config
sudo cp /etc/nginx/sites-available/bitjr /etc/nginx/sites-available/bitjr.backup

# Copy new config
sudo cp nginx-site.conf /etc/nginx/sites-available/bitjr

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 3: Restart Application
```bash
# Restart via PM2
pm2 restart bitjr-website

# Check status
pm2 status

# Monitor logs
pm2 logs bitjr-website --lines 20
```

### Step 4: Verify Changes
1. Open the site in an incognito window
2. Check HTML source - CSS/JS should have `?v=` parameter
3. Go to `/admin`
4. Try clicking "Clear Cache" button
5. Verify success message appears
6. Check that version number updates in HTML source

## 🔍 Testing Checklist

- [ ] Site loads correctly in regular browser
- [ ] Site loads correctly in incognito mode
- [ ] CSS styles are applied correctly
- [ ] JavaScript functionality works
- [ ] Admin panel is accessible
- [ ] "Clear Cache" button works
- [ ] "Restart Server" button works (with PM2)
- [ ] Blog posts display correctly
- [ ] Events display correctly
- [ ] Static images load correctly
- [ ] Forms submit correctly

## 🚨 Rollback Plan (If Needed)

If something goes wrong:

### Rollback Nginx:
```bash
sudo cp /etc/nginx/sites-available/bitjr.backup /etc/nginx/sites-available/bitjr
sudo nginx -t
sudo systemctl reload nginx
```

### Rollback Code:
```bash
cd /var/www/bitjr
git log --oneline  # Find the commit hash before changes
git checkout <previous-commit-hash>
pm2 restart bitjr-website
```

## 📊 Monitoring After Deployment

Monitor these for the first hour after deployment:

```bash
# Check PM2 status
pm2 status

# Monitor logs in real-time
pm2 logs bitjr-website

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check server resources
htop
```

## 🎯 Expected Results

After deployment:

1. **HTML pages** should have these headers:
   ```
   Cache-Control: no-cache, no-store, must-revalidate
   Pragma: no-cache
   Expires: 0
   ```

2. **Static files** should have:
   ```
   Cache-Control: public, max-age=3600
   ```

3. **CSS/JS includes** should look like:
   ```html
   <link rel="stylesheet" href="/static/css/styles.css?v=1738525200000">
   <script src="/static/js/main.js?v=1738525200000"></script>
   ```

4. **Admin panel** should show cache management card with working buttons

## 📞 Support

If issues arise:

1. Check PM2 logs: `pm2 logs bitjr-website`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify nginx config: `sudo nginx -t`
4. Check server status: `pm2 status`
5. Test in incognito mode to rule out local cache issues

## 🎉 Success Criteria

Deployment is successful when:

- ✅ Site loads without errors
- ✅ All pages display correctly
- ✅ Cache headers are present (check in browser DevTools)
- ✅ Version query parameters appear on CSS/JS files
- ✅ Admin cache management UI works
- ✅ PM2 shows app as "online"
- ✅ No errors in PM2 logs

---

**Date:** _______________  
**Deployed By:** _______________  
**Git Commit:** _______________  
**Notes:** _______________

