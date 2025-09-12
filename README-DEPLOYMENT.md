# Flipkart Price Tracker - Complete Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Bash shell (macOS/Linux)

### One-Command Deployment
```bash
chmod +x deploy-flipkart-complete.sh
./deploy-flipkart-complete.sh
```

## 📋 What Gets Deployed

### Infrastructure
- ✅ EC2 Instance (t2.micro)
- ✅ Security Group (SSH + HTTP)
- ✅ Key Pair for SSH access
- ✅ Lambda function for monitoring

### Application
- ✅ Node.js server on port 3000
- ✅ PM2 process manager
- ✅ Auto-restart on crash/reboot
- ✅ Telegram integration

### Monitoring
- ✅ Telegram status notifications
- ✅ Lambda-based health checks
- ✅ Automated alerts

## 🔧 Configuration

### Before Deployment
Edit `config.env` file:
```bash
# Update these values
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_CHAT_ID"
FLIPKART_AFFILIATE_ID="YOUR_AFFILIATE_ID"
FLIPKART_AFFILIATE_TOKEN="YOUR_AFFILIATE_TOKEN"
```

### For Different AWS Account
1. Configure AWS CLI: `aws configure`
2. Update region in `config.env` if needed
3. Run deployment script

## 📱 Telegram Setup

### Create Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions to get token
4. Update `TELEGRAM_BOT_TOKEN` in config

### Get Chat ID
1. Send message to your bot
2. Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Find your chat ID in response
4. Update `TELEGRAM_CHAT_ID` in config

## 🎯 Usage

### Check Status
```bash
# Via AWS CLI
aws lambda invoke --region us-east-1 --function-name flipkart-status-checker response.json

# Via SSH
ssh -i flipkart-key.pem ec2-user@<PUBLIC_IP>
pm2 status
```

### Management Commands
```bash
# Restart application
ssh -i flipkart-key.pem ec2-user@<PUBLIC_IP> "pm2 restart flipkart-tracker"

# View logs
ssh -i flipkart-key.pem ec2-user@<PUBLIC_IP> "pm2 logs"

# Stop application
ssh -i flipkart-key.pem ec2-user@<PUBLIC_IP> "pm2 stop flipkart-tracker"
```

## 🔄 Redeployment

### Same Account
```bash
# Terminate existing instance first
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>

# Run deployment again
./deploy-flipkart-complete.sh
```

### Different Account
1. Configure new AWS account: `aws configure`
2. Update `config.env` with new values
3. Run: `./deploy-flipkart-complete.sh`

## 📊 Monitoring

### Telegram Notifications
- ✅ Startup notification
- ✅ Periodic health checks (every 30 min)
- ✅ Manual status checks

### AWS CloudWatch
- ✅ Lambda function logs
- ✅ EC2 instance metrics

## 🛠️ Troubleshooting

### App Not Responding
```bash
# Check if instance is running
aws ec2 describe-instances --instance-ids <INSTANCE_ID>

# SSH and check PM2
ssh -i flipkart-key.pem ec2-user@<PUBLIC_IP>
pm2 status
pm2 logs
```

### Telegram Not Working
```bash
# Test bot token
curl -s "https://api.telegram.org/bot<TOKEN>/getMe"

# Test message sending
curl -s -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>" \
  -d "text=Test message"
```

### Lambda Issues
```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/flipkart"

# Test Lambda function
aws lambda invoke --function-name flipkart-status-checker response.json
```

## 💰 Cost Estimation

### AWS Resources (Monthly)
- EC2 t2.micro: $8.50 (if not free tier)
- Lambda: ~$0.20 (1M requests)
- Data Transfer: ~$1.00
- **Total: ~$10/month** (or free with AWS Free Tier)

## 🔒 Security Notes

- Key pair file (`flipkart-key.pem`) - Keep secure
- Security group allows SSH from anywhere (0.0.0.0/0)
- Telegram tokens in plaintext - Consider AWS Secrets Manager for production

## 📁 File Structure
```
flipkart-deployment/
├── deploy-flipkart-complete.sh    # Main deployment script
├── config.env                     # Configuration file
├── README-DEPLOYMENT.md           # This guide
├── flipkart-key.pem              # SSH key (generated)
└── deployment-summary.txt         # Deployment results
```

## 🎉 Success Indicators

1. ✅ Script completes without errors
2. ✅ Telegram startup message received
3. ✅ Web app responds: `curl http://<PUBLIC_IP>:3000`
4. ✅ Status check works via Lambda
5. ✅ SSH access available

---

**Need Help?** Check the deployment-summary.txt file created after successful deployment for all details and access information.