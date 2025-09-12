#!/bin/bash

EC2_IP="107.20.96.216"
PROJECT_DIR="/Users/yashodip.patil@avalara.com/DC1/flipkart"

echo "🚀 Deploying Flipkart Price Tracker to EC2..."

# Create deployment package
cd "$PROJECT_DIR"
tar -czf ../flipkart-deploy.tar.gz \
  *.js \
  *.json \
  *.sh \
  .env \
  --exclude=node_modules \
  --exclude=*.log \
  --exclude=*.pid

cd ..

# Upload to EC2 (using password authentication)
echo "⬆️ Uploading to EC2..."
scp -o StrictHostKeyChecking=no flipkart-deploy.tar.gz ec2-user@$EC2_IP:~/

# Setup on EC2
echo "🔧 Setting up on EC2..."
ssh -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'EOF'
  # Extract files
  tar -xzf flipkart-deploy.tar.gz
  
  # Install Node.js dependencies
  npm install axios dotenv form-data sqlite3
  
  # Make scripts executable
  chmod +x *.sh
  
  # Start services with PM2
  pm2 start telegram-bot.js --name "telegram-bot"
  pm2 start supabase-monitor.js --name "price-tracker" || pm2 start price-tracker.js --name "price-tracker"
  
  # Save PM2 configuration
  pm2 startup
  pm2 save
  
  echo "✅ Deployment complete!"
  pm2 status
EOF

echo "🎉 Flipkart Price Tracker deployed to: $EC2_IP"