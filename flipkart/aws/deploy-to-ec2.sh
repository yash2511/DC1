#!/bin/bash

# Deploy script for EC2
echo "🚀 Deploying Flipkart Price Tracker to EC2..."

# Replace with your EC2 details
EC2_HOST="ec2-user@YOUR-EC2-PUBLIC-IP"
KEY_FILE="flipkart-key.pem"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf flipkart-tracker.tar.gz \
  *.js \
  *.json \
  *.sh \
  .env \
  --exclude=node_modules \
  --exclude=*.log \
  --exclude=*.pid

# Upload to EC2
echo "⬆️ Uploading to EC2..."
scp -i "$KEY_FILE" flipkart-tracker.tar.gz "$EC2_HOST:~/"

# Connect and setup
echo "🔧 Setting up on EC2..."
ssh -i "$KEY_FILE" "$EC2_HOST" << 'EOF'
  # Extract files
  tar -xzf flipkart-tracker.tar.gz
  
  # Install dependencies
  npm install axios dotenv
  
  # Make scripts executable
  chmod +x *.sh
  
  # Setup PM2 processes
  pm2 start telegram-bot.js --name "telegram-bot"
  pm2 start supabase-monitor.js --name "price-tracker"
  
  # Save PM2 configuration
  pm2 startup
  pm2 save
  
  echo "✅ Deployment complete!"
  pm2 status
EOF

echo "🎉 Flipkart Price Tracker is now running 24/7 on AWS!"