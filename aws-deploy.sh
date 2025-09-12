#!/bin/bash

# AWS Deployment Script for Flipkart Price Tracker
# This script sets up the application on AWS EC2 for continuous running

set -e

echo "🚀 Starting AWS Deployment for Flipkart Price Tracker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ] || [ `head -c 3 /sys/hypervisor/uuid` != "ec2" ]; then
    print_warning "This script is designed to run on AWS EC2. Please run it on your EC2 instance."
fi

# Update system
print_status "Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js $node_version and npm $npm_version installed"

# Install PM2 globally for process management
print_status "Installing PM2 for process management..."
sudo npm install -g pm2

# Install additional dependencies
print_status "Installing system dependencies..."
sudo yum install -y git htop

# Create application directory
APP_DIR="/home/ec2-user/flipkart-price-tracker"
print_status "Setting up application directory at $APP_DIR..."

if [ -d "$APP_DIR" ]; then
    print_warning "Directory $APP_DIR already exists. Backing up..."
    sudo mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

sudo mkdir -p "$APP_DIR"
sudo chown ec2-user:ec2-user "$APP_DIR"

# Copy application files (assuming this script is run from the project directory)
print_status "Copying application files..."
cp -r . "$APP_DIR/"
cd "$APP_DIR"

# Install npm dependencies
print_status "Installing npm dependencies..."
npm install

# Install additional dependencies for chart generation
print_status "Installing chart generation dependencies..."
sudo yum install -y cairo-devel pkgconfig pixman-devel pangocairo-devel
npm install canvas

# Set up environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Flipkart Affiliate API
FLIPKART_AFFILIATE_ID=your_flipkart_affiliate_id_here
FLIPKART_AFFILIATE_TOKEN=your_flipkart_affiliate_token_here

# Supabase Configuration (if using)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=10000
NODE_ENV=production
EOF
    print_warning "Please edit $APP_DIR/.env file with your actual credentials"
fi

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: './flipkart/telegram-bot.js',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/telegram-bot-error.log',
      out_file: './logs/telegram-bot-out.log',
      log_file: './logs/telegram-bot-combined.log',
      time: true
    },
    {
      name: 'price-tracker',
      script: './flipkart/supabase-monitor.js',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/price-tracker-error.log',
      out_file: './logs/price-tracker-out.log',
      log_file: './logs/price-tracker-combined.log',
      time: true
    },
    {
      name: 'web-server',
      script: './server.js',
      cwd: '$APP_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 10000
      },
      error_file: './logs/web-server-error.log',
      out_file: './logs/web-server-out.log',
      log_file: './logs/web-server-combined.log',
      time: true
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Set up PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/flipkart-tracker << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create monitoring script
print_status "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
echo "=== Flipkart Price Tracker Status ==="
echo "Date: $(date)"
echo ""

echo "PM2 Process Status:"
pm2 status

echo ""
echo "System Resources:"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo "Memory Usage:"
free -h

echo ""
echo "Disk Usage:"
df -h /

echo ""
echo "Recent Logs (last 10 lines):"
echo "--- Telegram Bot ---"
tail -n 10 logs/telegram-bot-combined.log 2>/dev/null || echo "No logs yet"

echo "--- Price Tracker ---"
tail -n 10 logs/price-tracker-combined.log 2>/dev/null || echo "No logs yet"

echo "--- Web Server ---"
tail -n 10 logs/web-server-combined.log 2>/dev/null || echo "No logs yet"
EOF

chmod +x monitor.sh

# Create update script
print_status "Creating update script..."
cat > update.sh << 'EOF'
#!/bin/bash

echo "🔄 Updating Flipkart Price Tracker..."

# Stop PM2 processes
pm2 stop all

# Pull latest changes (if using git)
# git pull origin main

# Install/update dependencies
npm install

# Restart PM2 processes
pm2 start all

echo "✅ Update completed!"
EOF

chmod +x update.sh

# Set up firewall (if needed)
print_status "Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=10000/tcp
sudo firewall-cmd --reload

print_success "AWS deployment completed successfully!"
print_status "Next steps:"
echo "1. Edit $APP_DIR/.env with your actual credentials"
echo "2. Run: pm2 restart all"
echo "3. Check status: pm2 status"
echo "4. View logs: pm2 logs"
echo "5. Monitor: ./monitor.sh"

print_status "Your application is now running continuously on AWS EC2!"
print_status "Web server available at: http://your-ec2-ip:10000"
