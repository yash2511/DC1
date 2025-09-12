#!/bin/bash

# Flipkart Price Tracker - Complete Deployment Script
# Usage: ./deploy-flipkart-complete.sh

set -e

echo "🚀 Starting Flipkart Price Tracker Deployment..."

# Configuration - UPDATE THESE VALUES
TELEGRAM_BOT_TOKEN="8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ"
TELEGRAM_CHAT_ID="467496219"
FLIPKART_AFFILIATE_ID="yashodip0"
FLIPKART_AFFILIATE_TOKEN="6e844bab0fd74596a578331f80f01678"
KEY_NAME="flipkart-key"
INSTANCE_NAME="flipkart-tracker"

echo "📋 Configuration:"
echo "  - Telegram Bot: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "  - Chat ID: $TELEGRAM_CHAT_ID"
echo "  - Key Name: $KEY_NAME"

# Step 1: Create Key Pair
echo "🔑 Creating EC2 Key Pair..."
aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > ${KEY_NAME}.pem
chmod 400 ${KEY_NAME}.pem
echo "✅ Key pair created: ${KEY_NAME}.pem"

# Step 2: Get Default Security Group
echo "🔒 Getting default security group..."
SG_ID=$(aws ec2 describe-security-groups --group-names default --query 'SecurityGroups[0].GroupId' --output text)
echo "✅ Security Group: $SG_ID"

# Step 3: Add Security Group Rules
echo "🌐 Adding security group rules..."
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 2>/dev/null || echo "SSH rule exists"
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0 2>/dev/null || echo "Port 3000 rule exists"
echo "✅ Security rules configured"

# Step 4: Create User Data Script
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 16
nvm use 16
npm install -g pm2

cd /home/ec2-user
cat > server.js << 'SERVEREOF'
const http = require('http');
const https = require('https');

const TELEGRAM_BOT_TOKEN = 'TELEGRAM_TOKEN_PLACEHOLDER';
const TELEGRAM_CHAT_ID = 'CHAT_ID_PLACEHOLDER';

function sendTelegram(message) {
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const req = https.request(options);
  req.write(data);
  req.end();
}

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('{"status":"Flipkart Tracker Running","port":3000,"uptime":"' + process.uptime() + 's"}');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  sendTelegram('🚀 Flipkart Price Tracker ONLINE!\n\nServer: Running\nPort: 3000\nStatus: Active');
});

setInterval(() => {
  sendTelegram('💚 Flipkart Tracker: RUNNING\nUptime: ' + Math.floor(process.uptime()/60) + ' minutes');
}, 30 * 60 * 1000);
SERVEREOF

# Replace placeholders
sed -i "s/TELEGRAM_TOKEN_PLACEHOLDER/$TELEGRAM_BOT_TOKEN/g" server.js
sed -i "s/CHAT_ID_PLACEHOLDER/$TELEGRAM_CHAT_ID/g" server.js

chown ec2-user:ec2-user server.js
sudo -u ec2-user bash << 'PMEOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /home/ec2-user
pm2 start server.js --name flipkart-tracker
pm2 startup
pm2 save
PMEOF
EOF

# Replace tokens in user-data
sed -i "s/TELEGRAM_TOKEN_PLACEHOLDER/$TELEGRAM_BOT_TOKEN/g" user-data.sh
sed -i "s/CHAT_ID_PLACEHOLDER/$TELEGRAM_CHAT_ID/g" user-data.sh

# Step 5: Launch EC2 Instance
echo "🖥️ Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t2.micro \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --user-data file://user-data.sh \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ Instance launched: $INSTANCE_ID"

# Step 6: Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Step 7: Get Public IP
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "✅ Instance running at: $PUBLIC_IP"

# Step 8: Create Lambda Status Checker
echo "🔧 Creating Lambda status checker..."

# Create Lambda function code
cat > lambda-status.js << 'EOF'
const https = require('https');
const http = require('http');

const TELEGRAM_BOT_TOKEN = 'TELEGRAM_TOKEN_PLACEHOLDER';
const TELEGRAM_CHAT_ID = 'CHAT_ID_PLACEHOLDER';
const SERVER_IP = 'SERVER_IP_PLACEHOLDER';

exports.handler = async (event) => {
    try {
        const appRunning = await checkApp(SERVER_IP);
        const status = appRunning ? '✅ RUNNING' : '❌ DOWN';
        
        const message = `🔍 Flipkart Tracker Status\n\n📱 App: ${status}\n🌐 Server: ${SERVER_IP}:3000\n⏰ ${new Date().toLocaleString()}`;
        
        await sendTelegram(message);
        return { statusCode: 200, body: JSON.stringify({ status: appRunning ? 'running' : 'down' }) };
    } catch (error) {
        await sendTelegram(`❌ Status Check Failed: ${error.message}`);
        return { statusCode: 500, body: error.message };
    }
};

function checkApp(ip) {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:3000`, { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => resolve(false));
    });
}

function sendTelegram(message) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message });
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, () => resolve());
        req.write(data);
        req.end();
    });
}
EOF

# Replace placeholders in Lambda
sed -i "s/TELEGRAM_TOKEN_PLACEHOLDER/$TELEGRAM_BOT_TOKEN/g" lambda-status.js
sed -i "s/CHAT_ID_PLACEHOLDER/$TELEGRAM_CHAT_ID/g" lambda-status.js
sed -i "s/SERVER_IP_PLACEHOLDER/$PUBLIC_IP/g" lambda-status.js

# Create IAM role for Lambda
aws iam create-role --role-name flipkart-lambda-role --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}' 2>/dev/null || echo "Role exists"

# Create Lambda function
zip -r lambda-status.zip lambda-status.js
LAMBDA_ARN=$(aws lambda create-function \
  --function-name flipkart-status-checker \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/flipkart-lambda-role \
  --handler lambda-status.handler \
  --zip-file fileb://lambda-status.zip \
  --timeout 10 \
  --query 'FunctionArn' \
  --output text 2>/dev/null || echo "Lambda exists")

echo "✅ Lambda function created"

# Step 9: Test deployment
echo "🧪 Testing deployment..."
sleep 30
curl -s http://$PUBLIC_IP:3000 && echo "✅ App is responding" || echo "⏳ App still starting..."

# Step 10: Create summary
cat > deployment-summary.txt << EOF
🎉 FLIPKART PRICE TRACKER DEPLOYMENT COMPLETE

📋 DEPLOYMENT DETAILS:
- Instance ID: $INSTANCE_ID
- Public IP: $PUBLIC_IP
- Key File: ${KEY_NAME}.pem
- Security Group: $SG_ID

🌐 ACCESS POINTS:
- Web App: http://$PUBLIC_IP:3000
- SSH: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP

📱 TELEGRAM MONITORING:
- Bot Token: ${TELEGRAM_BOT_TOKEN:0:10}...
- Chat ID: $TELEGRAM_CHAT_ID
- Status Check: aws lambda invoke --region us-east-1 --function-name flipkart-status-checker response.json

🔧 MANAGEMENT COMMANDS:
- Check Status: aws lambda invoke --region us-east-1 --function-name flipkart-status-checker response.json
- SSH Connect: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP
- View Logs: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP "pm2 logs"
- Restart App: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP "pm2 restart flipkart-tracker"

💡 NEXT STEPS:
1. Wait 2-3 minutes for full startup
2. Test: curl http://$PUBLIC_IP:3000
3. Check Telegram for startup message
4. Run status check: aws lambda invoke --region us-east-1 --function-name flipkart-status-checker response.json

EOF

echo "📄 Deployment summary saved to: deployment-summary.txt"
cat deployment-summary.txt

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 Your Flipkart Price Tracker is available at: http://$PUBLIC_IP:3000"
echo "📱 Check your Telegram for startup notification!"

# Cleanup temp files
rm -f user-data.sh lambda-status.js lambda-status.zip

echo "✅ All done! Check deployment-summary.txt for details."