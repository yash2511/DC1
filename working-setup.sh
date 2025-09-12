#!/bin/bash
yum update -y
yum install -y nodejs npm

cd /home/ec2-user
cat > server.js << 'EOF'
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('{"status":"Flipkart Tracker Running","port":3000}');
});
server.listen(3000, () => console.log('Running on 3000'));
EOF

chown ec2-user:ec2-user server.js
nohup sudo -u ec2-user node server.js > /var/log/app.log 2>&1 &