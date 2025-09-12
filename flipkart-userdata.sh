#!/bin/bash
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git

# Install PM2 globally
npm install -g pm2

# Create project directory
mkdir -p /home/ec2-user/flipkart-tracker
cd /home/ec2-user/flipkart-tracker

# Create package.json
cat > package.json << 'EOF'
{
  "name": "flipkart-price-tracker",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.11.0",
    "dotenv": "^17.2.2"
  }
}
EOF

# Install dependencies
npm install

# Create environment file
cat > .env << 'EOF'
PORT=3000
FLIPKART_AFFILIATE_ID=yashodip0
FLIPKART_AFFILIATE_TOKEN=6e844bab0fd74596a578331f80f01678
TELEGRAM_BOT_TOKEN=8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ
TELEGRAM_CHAT_ID=467496219
EOF

# Create server file
cat > server.js << 'EOF'
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'Flipkart Price Tracker Running on EC2',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Flipkart Price Tracker running on port ${PORT}`);
});
EOF

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/flipkart-tracker

# Start with PM2 as ec2-user
sudo -u ec2-user bash << 'EOF'
cd /home/ec2-user/flipkart-tracker
pm2 start server.js --name flipkart-tracker
pm2 startup
pm2 save
EOF

echo "✅ Flipkart Price Tracker deployed successfully!"