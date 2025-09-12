#!/bin/bash

# Setup script to run on EC2 instance
INSTANCE_ID="i-09d02565ccdfec732"

# Create the setup commands
cat > setup-commands.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user

# Install Node.js and npm
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

# Create project directory
mkdir -p flipkart-tracker
cd flipkart-tracker

# Create package.json
cat > package.json << 'PACKAGE_EOF'
{
  "name": "flipkart-price-tracker",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "axios": "^1.11.0",
    "dotenv": "^17.2.2",
    "form-data": "^4.0.4",
    "sqlite3": "^5.1.6"
  }
}
PACKAGE_EOF

# Install dependencies
npm install

echo "✅ EC2 setup complete!"
EOF

# Send commands to EC2 instance
/usr/local/bin/aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["bash -s"]' \
  --input file://setup-commands.sh