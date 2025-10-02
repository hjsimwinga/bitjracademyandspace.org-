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

echo "✅ Basic setup complete!"
echo "📋 Next steps:"
echo "1. Upload your application files to /var/www/bitjr"
echo "2. Run: cd /var/www/bitjr && npm install"
echo "3. Configure nginx"
echo "4. Start with PM2"
echo "5. Set up SSL"
echo ""
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"

