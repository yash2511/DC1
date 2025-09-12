# AWS Deployment Guide for Flipkart Price Tracker

This guide will help you deploy your Flipkart Price Tracker application on AWS EC2 for continuous 24/7 operation.

## Prerequisites

- AWS Account (Free Tier eligible)
- Telegram Bot Token and Chat ID
- Flipkart Affiliate API credentials
- Basic knowledge of AWS EC2

## Step 1: Launch AWS EC2 Instance

### 1.1 Create EC2 Instance
1. **Login to AWS Console** → Go to EC2 service
2. **Click "Launch Instance"**
3. **Configure Instance:**
   - **Name:** `flipkart-price-tracker`
   - **AMI:** Amazon Linux 2023 (Free tier eligible)
   - **Instance Type:** t2.micro (Free tier eligible)
   - **Key Pair:** Create new or use existing
   - **Security Group:** Create new with rules:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - Custom TCP (10000) - Anywhere (for web server)

### 1.2 Configure Storage
- **Volume Type:** gp3
- **Size:** 8 GB (Free tier limit)
- **Encryption:** Enabled (recommended)

### 1.3 Launch Instance
- Review settings and click "Launch Instance"
- Download your key pair (.pem file)
- Wait for instance to be "Running"

## Step 2: Connect to EC2 Instance

### 2.1 SSH Connection
```bash
# Make key file secure
chmod 400 your-key-pair.pem

# Connect to instance
ssh -i your-key-pair.pem ec2-user@your-ec2-public-ip
```

### 2.2 Update System
```bash
sudo yum update -y
```

## Step 3: Deploy Application

### 3.1 Upload Application Files

**Option A: Using SCP (from your local machine)**
```bash
# Upload entire project
scp -i your-key-pair.pem -r /path/to/your/project ec2-user@your-ec2-ip:/home/ec2-user/
```

**Option B: Using Git (recommended)**
```bash
# On EC2 instance
cd /home/ec2-user
git clone https://github.com/your-username/your-repo.git flipkart-price-tracker
cd flipkart-price-tracker
```

### 3.2 Run Deployment Script
```bash
# Make script executable
chmod +x aws-deploy.sh

# Run deployment script
./aws-deploy.sh
```

The script will:
- Install Node.js 18.x
- Install PM2 for process management
- Install all dependencies
- Set up environment configuration
- Configure auto-startup
- Set up log rotation
- Configure firewall

## Step 4: Configure Environment Variables

### 4.1 Edit Environment File
```bash
nano .env
```

### 4.2 Add Your Credentials
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token
TELEGRAM_CHAT_ID=your_actual_telegram_chat_id

# Flipkart Affiliate API
FLIPKART_AFFILIATE_ID=your_actual_flipkart_affiliate_id
FLIPKART_AFFILIATE_TOKEN=your_actual_flipkart_affiliate_token

# Supabase Configuration (if using)
SUPABASE_URL=your_actual_supabase_url
SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Server Configuration
PORT=10000
NODE_ENV=production
```

### 4.3 Restart Applications
```bash
pm2 restart all
```

## Step 5: Verify Deployment

### 5.1 Check Application Status
```bash
pm2 status
```

Expected output:
```
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ telegram-bot    │ default     │ 1.0.0   │ fork    │ 1234     │ 1m     │ 0    │ online    │ 0%       │ 45.2mb   │ ec2-user │ disabled │
│ 1   │ price-tracker   │ default     │ 1.0.0   │ fork    │ 1235     │ 1m     │ 0    │ online    │ 0%       │ 67.8mb   │ ec2-user │ disabled │
│ 2   │ web-server      │ default     │ 1.0.0   │ fork    │ 1236     │ 1m     │ 0    │ online    │ 0%       │ 23.4mb   │ ec2-user │ disabled │
└─────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### 5.2 Test Web Server
```bash
curl http://localhost:10000
```

Expected response:
```json
{
  "status": "running",
  "message": "Flipkart Price Monitor is active",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5.3 Test Telegram Bot
Send a message to your Telegram bot:
- `/start` - Start price tracking
- `/status` - Check status
- `/charts` - View price charts

## Step 6: Monitoring and Maintenance

### 6.1 Monitor Application
```bash
# Check status
./monitor.sh

# View real-time logs
pm2 logs

# View specific app logs
pm2 logs telegram-bot
pm2 logs price-tracker
pm2 logs web-server
```

### 6.2 Update Application
```bash
# Run update script
./update.sh

# Or manually
pm2 stop all
git pull origin main  # if using git
npm install
pm2 start all
```

### 6.3 Restart Services
```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart telegram-bot
pm2 restart price-tracker
pm2 restart web-server
```

## Step 7: Security Best Practices

### 7.1 Configure Security Group
- Only allow necessary ports (22, 80, 10000)
- Restrict SSH access to your IP only
- Consider using a VPN for additional security

### 7.2 Regular Updates
```bash
# Update system packages
sudo yum update -y

# Update Node.js dependencies
npm audit fix
```

### 7.3 Backup Strategy
```bash
# Backup application data
tar -czf backup-$(date +%Y%m%d).tar.gz /home/ec2-user/flipkart-price-tracker

# Backup to S3 (optional)
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

## Troubleshooting

### Common Issues

**1. PM2 not starting on boot**
```bash
pm2 startup
pm2 save
```

**2. Out of memory errors**
```bash
# Check memory usage
free -h
pm2 monit
```

**3. Application not responding**
```bash
# Check logs
pm2 logs --err

# Restart application
pm2 restart all
```

**4. Telegram bot not working**
- Verify bot token and chat ID in .env
- Check if bot is added to your chat
- Test with curl:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

### Log Locations
- Application logs: `/home/ec2-user/flipkart-price-tracker/logs/`
- System logs: `/var/log/messages`
- PM2 logs: `~/.pm2/logs/`

## Cost Optimization

### Free Tier Usage
- **EC2 t2.micro:** 750 hours/month free
- **EBS Storage:** 30 GB free
- **Data Transfer:** 1 GB/month free

### Monitoring Costs
- Use AWS Cost Explorer to monitor usage
- Set up billing alerts
- Consider stopping instance during development

## Scaling Options

### Vertical Scaling
- Upgrade to larger instance type (t2.small, t2.medium)
- Increase EBS volume size

### Horizontal Scaling
- Use Application Load Balancer
- Deploy multiple instances
- Use Auto Scaling Groups

## Support and Maintenance

### Regular Tasks
- Monitor application logs weekly
- Update dependencies monthly
- Review AWS costs monthly
- Backup data regularly

### Emergency Contacts
- AWS Support (if you have a support plan)
- Application logs for debugging
- PM2 documentation for process management

---

## Quick Commands Reference

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Monitor system
./monitor.sh

# Update application
./update.sh

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
```

Your Flipkart Price Tracker is now running continuously on AWS! 🚀
