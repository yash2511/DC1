# AWS Free Tier Deployment Guide

## Option 1: EC2 Instance (Recommended)

### Setup Steps:
1. **Launch EC2 t2.micro instance**
   - AMI: Amazon Linux 2
   - Instance Type: t2.micro (free tier)
   - Storage: 8GB (free tier)
   - Security Group: Allow SSH (22) and HTTP (80)

2. **Install Node.js**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

3. **Deploy code**
   ```bash
   git clone <your-repo>
   cd flipkart
   npm install
   ```

4. **Setup PM2 for continuous running**
   ```bash
   sudo npm install -g pm2
   pm2 start telegram-bot.js --name "telegram-bot"
   pm2 start supabase-monitor.js --name "price-tracker"
   pm2 startup
   pm2 save
   ```

### Benefits:
✅ 24/7 uptime
✅ Auto-restart on crashes
✅ Remote access via SSH
✅ Free for 12 months

## Option 2: Lambda + EventBridge

### Setup Steps:
1. **Create Lambda function**
   - Runtime: Node.js 18.x
   - Memory: 512MB
   - Timeout: 15 minutes

2. **Upload code as ZIP**
   ```bash
   zip -r price-tracker.zip .
   ```

3. **Setup EventBridge trigger**
   - Schedule: rate(30 minutes)
   - Target: Lambda function

### Benefits:
✅ Serverless (no server management)
✅ Pay per execution
✅ Auto-scaling
✅ Always free tier eligible

## Option 3: Lightsail VPS

### Setup Steps:
1. **Create Lightsail instance**
   - OS: Ubuntu 20.04
   - Plan: $3.50/month
   - Static IP included

2. **Same deployment as EC2**

### Benefits:
✅ Predictable pricing
✅ Easy management
✅ Static IP included
✅ Simple firewall rules