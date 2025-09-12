#!/bin/bash
yum update -y
yum install -y nodejs npm git
npm install -g pm2
mkdir -p /home/ec2-user/flipkart-tracker
chown ec2-user:ec2-user /home/ec2-user/flipkart-tracker