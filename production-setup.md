# BitJR Academy Production Deployment Guide

## Current Issue
The website is showing a 404 Not Found error because:
1. The nginx configuration wasn't properly configured with the correct domain
2. The Node.js application may not be running
3. The server configuration needs to be updated

## Quick Fix Commands (Run on server)

### 1. Navigate to your application directory
```bash
cd /var/www/bitjr
# or wherever your application is deployed
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application with PM2
```bash
# Install PM2 globally if not already installed
sudo npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4. Update nginx configuration
```bash
# Copy the nginx configuration
sudo cp nginx-site.conf /etc/nginx/sites-available/bitjr
sudo ln -sf /etc/nginx/sites-available/bitjr /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. Verify services are running
```bash
# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check if application is responding
curl http://localhost:3000
```

## Troubleshooting

### If PM2 fails to start:
```bash
# Check logs
pm2 logs bitjr-academy

# Restart the application
pm2 restart bitjr-academy
```

### If nginx fails:
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify configuration syntax
sudo nginx -t
```

### If the application still doesn't work:
```bash
# Check if port 3000 is available
sudo netstat -tlnp | grep :3000

# Check application logs
pm2 logs bitjr-academy --lines 50
```

## SSL Setup (Optional but Recommended)
```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bitjracademyandspace.org -d www.bitjracademyandspace.org
```

## File Permissions
Make sure the application files have correct permissions:
```bash
sudo chown -R www-data:www-data /var/www/bitjr
sudo chmod -R 755 /var/www/bitjr
```

## Testing
After completing the setup, test the website:
- http://bitjracademyandspace.org
- https://bitjracademyandspace.org (if SSL is configured)

The website should now be accessible and showing the homepage instead of a 404 error.
