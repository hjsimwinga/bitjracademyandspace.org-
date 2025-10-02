#!/bin/bash

# BitJR Academy Deployment Script for Hetzner VPS
# Run this script on your VPS after uploading your files

echo "🚀 Starting BitJR Academy deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt-get install -y nodejs

# Install nginx
echo "📦 Installing nginx..."
apt install nginx -y

# Install PM2 globally
echo "📦 Installing PM2 process manager..."
npm install -g pm2

# Install certbot for SSL
echo "📦 Installing certbot for SSL..."
apt install certbot python3-certbot-nginx -y

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /var/www/bitjr
cd /var/www/bitjr

# Set proper ownership
chown -R www-data:www-data /var/www/bitjr

# After basic setup, configure the application
echo "📦 Installing application dependencies..."
cd /var/www/bitjr
npm install

echo "⚙️  Configuring nginx..."
cp nginx-site.conf /etc/nginx/sites-available/bitjr
ln -sf /etc/nginx/sites-available/bitjr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "🔧 Testing nginx configuration..."
nginx -t

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "🔄 Restarting nginx..."
systemctl restart nginx

echo "✅ Deployment complete!"
echo "📋 Verification:"
echo "- PM2 Status: $(pm2 list | grep bitjr-academy)"
echo "- Nginx Status: $(systemctl is-active nginx)"
echo "- Website: http://bitjracademyandspace.org"
echo ""
echo "🔐 To set up SSL certificate, run:"
echo "certbot --nginx -d bitjracademyandspace.org -d www.bitjracademyandspace.org"

