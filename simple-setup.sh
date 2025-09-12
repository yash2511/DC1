#!/bin/bash
yum update -y
yum install -y nodejs npm
npm install -g pm2

cd /home/ec2-user
cat > app.js << 'EOF'
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    status: 'Flipkart Price Tracker Running',
    timestamp: new Date().toISOString()
  }));
});
server.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));
EOF

chown ec2-user:ec2-user app.js
sudo -u ec2-user pm2 start app.js --name flipkart
sudo -u ec2-user pm2 startup
sudo -u ec2-user pm2 save