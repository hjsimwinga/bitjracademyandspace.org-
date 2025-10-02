# Admin Subdomain Deployment Instructions

## Overview
This guide will help you deploy the admin subdomain configuration for BitJR Academy & Space, making `admin.bitjracademyandspace.org` point to your admin interface.

## What Was Changed

### 1. Nginx Configuration (`nginx-site.conf`)
- Added a new server block for `admin.bitjracademyandspace.org`
- Routes admin subdomain root (`/`) to `localhost:3000/admin`
- Handles API routes and admin sub-routes properly
- Serves static files and images for the admin interface

### 2. Express App (`src/server.js`)
- Added subdomain detection for admin routes
- Passes `isAdminSubdomain` flag to admin views

### 3. Admin Views
- Fixed CSS asset paths from `/css/styles.css` to `/static/css/styles.css`
- Updated "Back to Website" link to handle subdomain properly

## DNS Configuration ✅
You've already set up the DNS A record in NameCheap:
- `admin.bitjracademyandspace.org` → `135.181.204.240`

## Deployment Steps

### Step 1: Update Nginx Configuration
```bash
# Copy the updated nginx configuration to your server
sudo cp nginx-site.conf /etc/nginx/sites-available/bitjr

# Test the nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 2: Deploy Application Changes
```bash
# Pull latest changes
git add .
git commit -m "Add admin subdomain configuration"
git push origin main

# On your server, pull the changes
git pull origin main

# Restart your application (if using PM2)
pm2 restart all
```

### Step 3: Test the Configuration
1. **Main website**: Visit `http://bitjracademyandspace.org` - should work as before
2. **Admin subdomain**: Visit `http://admin.bitjracademyandspace.org` - should redirect to admin portal
3. **Admin interface**: Should be accessible at `http://admin.bitjracademyandspace.org`

## URL Structure After Deployment

| URL | Purpose |
|-----|---------|
| `bitjracademyandspace.org` | Main website |
| `admin.bitjracademyandspace.org` | Admin portal (redirects to `/admin`) |
| `admin.bitjracademyandspace.org/blogs` | Blog management |
| `admin.bitjracademyandspace.org/events` | Event management |

## SSL Configuration (Next Step)
Once HTTP is working, you can add SSL certificates:

```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates for both domains
sudo certbot --nginx -d bitjracademyandspace.org -d www.bitjracademyandspace.org -d admin.bitjracademyandspace.org
```

## Troubleshooting

### If admin subdomain doesn't work:
1. Check DNS propagation: `nslookup admin.bitjracademyandspace.org`
2. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify nginx config: `sudo nginx -t`
4. Check if your app is running: `pm2 status`

### If static files don't load:
1. Verify static file paths in nginx config match your actual directory structure
2. Check file permissions: `ls -la /var/www/bitjr/public/`

### If API calls fail:
1. Check browser developer tools for network errors
2. Verify API routes are accessible from the subdomain
3. Check CORS settings if needed

## Security Notes
- The admin portal is now accessible via a subdomain, consider adding authentication
- SSL certificates should be added for production use
- Consider IP whitelisting for admin access if needed

---

**Status**: Configuration complete, ready for deployment!
