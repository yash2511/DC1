# Flipkart Price Tracker with Supabase & Telegram Integration

## 🚀 Overview

A comprehensive price tracking system that monitors Flipkart products, stores price history in Supabase database, generates user-friendly charts, and sends intelligent alerts via Telegram when prices drop by 2% or more.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Flipkart API  │───▶│   EC2 Instance   │───▶│   Supabase DB   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │  Chart Generator │    │ Price History   │
                    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │  Telegram Bot    │◀───│ Alert Logic     │
                    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Lambda Control   │
                    └──────────────────┘
```

## 📊 Core Components

### 1. Price Tracking Engine
- **File**: `price-tracker-supabase.js`
- **Function**: Monitors Flipkart products via API
- **Frequency**: Configurable intervals
- **Logic**: Fetches current prices and compares with historical data

### 2. Supabase Database Integration
- **File**: `supabase-database.js`
- **Tables**: 
  - `products`: Product info and lowest prices
  - `price_history`: Complete price records with timestamps
- **Operations**: CRUD operations for price data

### 3. Chart Generation System
- **File**: `price-chart-generator.js`
- **Features**: 
  - User-friendly SVG charts
  - Price trend visualization
  - Date information integration
  - Gradient backgrounds and professional styling

### 4. Alert Logic
- **Trigger**: Price reduction ≥ 2% from highest recorded price
- **Message**: "🚨 PRICE DROP ALERT! 🚨"
- **Data**: Current price, discount %, stock status, price history

### 5. Telegram Integration
- **Bot Token**: `8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ`
- **Chat ID**: `467496219`
- **Features**: Rich messages with charts, price statistics

### 6. EC2 Control via Lambda
- **Function**: `ec2-telegram-control`
- **Commands**: `startec2`, `stopec2`, `status`
- **Purpose**: Remote EC2 management for cost control

## 🔧 Implementation Details

### Database Schema

```sql
-- Products table
CREATE TABLE products (
  product_id VARCHAR PRIMARY KEY,
  title TEXT,
  lowest_price DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Price history table
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR,
  price DECIMAL,
  recorded_at TIMESTAMP
);
```

### Alert Logic Flow

```javascript
// 1. Fetch current price from Flipkart API
const currentPrice = info.flipkartSpecialPrice.amount;

// 2. Store price in Supabase
await addPriceRecord(productId, currentPrice);

// 3. Get price statistics
const stats = await getPriceStatistics(productId);

// 4. Check for 2%+ reduction
if (stats && stats.reductionPercent >= 2) {
  await sendAlert(product); // Send Telegram alert with chart
}
```

### Chart Generation Features

```javascript
// Enhanced chart with:
- Gradient backgrounds
- Price info boxes with current price & savings
- Highlighted lowest price points
- Date information (DD/MM/YY format)
- Professional typography
- Grid lines with price markers
- Legend and tracking period info
```

## 📱 Telegram Commands

### Price Tracker Commands (On EC2)
- `start` - Start price monitoring
- `stop` - Stop price monitoring  
- `status` - Check tracker status
- `charts` - View price charts

### EC2 Control Commands (Via Lambda)
- `startec2` - Start EC2 instance
- `stopec2` - Stop EC2 instance
- `status` - Check EC2 status

## 🚀 Deployment Guide

### Prerequisites
- AWS CLI configured
- Supabase account and database
- Telegram bot token
- Flipkart affiliate credentials

### Step 1: Environment Setup
```bash
# Clone repository
git clone <repository>
cd flipkart-price-tracker

# Configure environment
cp .env.example .env
# Update .env with your credentials
```

### Step 2: Supabase Setup
```bash
# Create tables
psql -h <supabase-host> -d <database> -f schema.sql

# Update supabase credentials in .env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: EC2 Deployment
```bash
# Use deployment script
chmod +x deploy-flipkart-complete.sh
./deploy-flipkart-complete.sh

# Or manual deployment
aws ec2 run-instances --image-id ami-0c02fb55956c7d316 \
  --count 1 --instance-type t2.micro \
  --key-name flipkart-key \
  --user-data file://user-data.sh
```

### Step 4: Lambda Setup
```bash
# Create Lambda function
zip -r ec2-control.zip fixed-ec2-control.js
aws lambda create-function \
  --function-name ec2-telegram-control \
  --runtime nodejs18.x \
  --role arn:aws:iam::account:role/lambda-role \
  --handler fixed-ec2-control.handler \
  --zip-file fileb://ec2-control.zip
```

### Step 5: API Gateway Webhook
```bash
# Create API Gateway
aws apigateway create-rest-api --name ec2-telegram-webhook

# Setup webhook endpoint
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/webhook"
```

## 📊 Configuration Files

### products.json
```json
{
  "categories": ["mobile", "laptop", "tv", "headphones"],
  "brands": ["apple", "samsung", "oneplus", "sony"]
}
```

### .env
```bash
FLIPKART_AFFILIATE_ID=your-affiliate-id
FLIPKART_AFFILIATE_TOKEN=your-affiliate-token
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## 🔍 Monitoring & Logs

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs supabase-tracker

# Restart
pm2 restart supabase-tracker
```

### AWS CloudWatch
- Lambda function logs: `/aws/lambda/ec2-telegram-control`
- EC2 instance metrics via CloudWatch dashboard

## 💰 Cost Optimization

### EC2 Control
- **Start**: `startec2` command via Telegram
- **Stop**: `stopec2` command via Telegram  
- **Auto-shutdown**: Configurable idle timeouts

### Resource Usage
- **EC2**: t2.micro (free tier eligible)
- **Lambda**: Pay per invocation
- **Supabase**: Free tier for small datasets
- **Estimated Cost**: ~$10/month (or free with AWS Free Tier)

## 🛠️ Troubleshooting

### Common Issues

1. **Telegram commands not working**
   ```bash
   # Check webhook status
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   
   # Reset webhook
   curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
   ```

2. **EC2 connection timeout**
   ```bash
   # Check security group rules
   aws ec2 describe-security-groups --group-ids <sg-id>
   
   # Verify instance status
   aws ec2 describe-instances --instance-ids <instance-id>
   ```

3. **Supabase connection errors**
   ```bash
   # Test connection
   curl -H "apikey: <key>" "<supabase-url>/rest/v1/products"
   ```

### Debug Commands
```bash
# Check PM2 processes
ssh -i flipkart-key.pem ec2-user@<ip> "pm2 status"

# View application logs
ssh -i flipkart-key.pem ec2-user@<ip> "pm2 logs --lines 50"

# Test Lambda function
aws lambda invoke --function-name ec2-telegram-control \
  --payload '{"body":"{\"message\":{\"chat\":{\"id\":467496219},\"text\":\"status\"}}"}' \
  response.json
```

## 🔐 Security Considerations

### API Keys
- Store sensitive credentials in AWS Secrets Manager (production)
- Use environment variables for development
- Rotate keys regularly

### Network Security
- Restrict security group access to necessary ports
- Use VPC for enhanced isolation
- Enable CloudTrail for audit logging

### Telegram Security
- Validate chat IDs in webhook handlers
- Use HTTPS for all API communications
- Implement rate limiting for commands

## 📈 Performance Optimization

### Database
- Index frequently queried columns
- Implement data retention policies
- Use connection pooling

### Monitoring
- Set up CloudWatch alarms for high CPU/memory
- Monitor Lambda execution duration
- Track API rate limits

### Scaling
- Use Auto Scaling Groups for high availability
- Implement SQS for message queuing
- Consider containerization with ECS

## 🚀 Future Enhancements

### Planned Features
- [ ] Multi-marketplace support (Amazon, eBay)
- [ ] Price prediction using ML
- [ ] Web dashboard for management
- [ ] Mobile app integration
- [ ] Advanced filtering and search

### Technical Improvements
- [ ] Microservices architecture
- [ ] Redis caching layer
- [ ] GraphQL API
- [ ] Real-time WebSocket updates
- [ ] Kubernetes deployment

## 📞 Support

### Documentation
- API documentation: `/docs/api.md`
- Deployment guide: `/docs/deployment.md`
- Troubleshooting: `/docs/troubleshooting.md`

### Contact
- Issues: GitHub Issues
- Email: support@flipkart-tracker.com
- Telegram: @FlipkartTrackerSupport

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**License**: MIT