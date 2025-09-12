#!/bin/bash

# AWS Setup Script for Flipkart Price Tracker Deployment
# This script helps you authenticate with AWS and set up your environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔐 AWS Authentication Setup for Flipkart Price Tracker"
echo "=================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_status "Installing AWS CLI..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install awscli
        else
            print_error "Homebrew not found. Please install AWS CLI manually:"
            echo "curl 'https://awscli.amazonaws.com/AWSCLIV2.pkg' -o 'AWSCLIV2.pkg'"
            echo "sudo installer -pkg AWSCLIV2.pkg -target /"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    else
        print_error "Unsupported OS. Please install AWS CLI manually."
        exit 1
    fi
else
    print_success "AWS CLI is already installed"
fi

# Check AWS CLI version
aws_version=$(aws --version)
print_success "AWS CLI version: $aws_version"

echo ""
print_status "Now you need to configure AWS CLI with your credentials..."
echo ""
echo "You have two options:"
echo "1. Use existing AWS credentials (if you have them)"
echo "2. Create new AWS credentials"
echo ""

read -p "Do you have AWS credentials? (y/n): " has_credentials

if [[ $has_credentials == "y" || $has_credentials == "Y" ]]; then
    print_status "Configuring AWS CLI with your existing credentials..."
    aws configure
else
    echo ""
    print_warning "You need to create AWS credentials first!"
    echo ""
    echo "📋 Steps to create AWS credentials:"
    echo "1. Go to AWS Console: https://console.aws.amazon.com/"
    echo "2. Sign in to your AWS account"
    echo "3. Go to IAM → Users → Create user"
    echo "4. Username: flipkart-deployer"
    echo "5. Select 'Programmatic access'"
    echo "6. Attach policy: AmazonEC2FullAccess"
    echo "7. Create user and download the CSV file"
    echo "8. Run this script again with your credentials"
    echo ""
    exit 0
fi

# Test AWS connection
print_status "Testing AWS connection..."
if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS authentication successful!"
    
    # Get account info
    account_id=$(aws sts get-caller-identity --query Account --output text)
    user_arn=$(aws sts get-caller-identity --query Arn --output text)
    
    echo ""
    print_success "Connected to AWS Account: $account_id"
    print_success "User: $user_arn"
    echo ""
    
    # Check if user has EC2 permissions
    print_status "Checking EC2 permissions..."
    if aws ec2 describe-regions &> /dev/null; then
        print_success "EC2 permissions confirmed!"
    else
        print_error "No EC2 permissions. Please attach AmazonEC2FullAccess policy to your user."
        exit 1
    fi
    
    # List available regions
    print_status "Available AWS regions:"
    aws ec2 describe-regions --query 'Regions[].RegionName' --output table
    
    echo ""
    print_success "AWS setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Choose a region (recommended: us-east-1 for free tier)"
    echo "2. Launch EC2 instance using AWS Console or CLI"
    echo "3. Run the deployment script on your EC2 instance"
    echo ""
    
    # Offer to create EC2 instance
    read -p "Would you like to create an EC2 instance now? (y/n): " create_ec2
    
    if [[ $create_ec2 == "y" || $create_ec2 == "Y" ]]; then
        print_status "Creating EC2 instance..."
        
        # Get default region
        default_region=$(aws configure get region)
        if [[ -z "$default_region" ]]; then
            default_region="us-east-1"
        fi
        
        echo "Using region: $default_region"
        
        # Create key pair
        key_name="flipkart-tracker-key"
        print_status "Creating key pair: $key_name"
        
        if aws ec2 describe-key-pairs --key-names "$key_name" --region "$default_region" &> /dev/null; then
            print_warning "Key pair $key_name already exists"
        else
            aws ec2 create-key-pair --key-name "$key_name" --region "$default_region" --query 'KeyMaterial' --output text > "${key_name}.pem"
            chmod 400 "${key_name}.pem"
            print_success "Key pair created: ${key_name}.pem"
        fi
        
        # Create security group
        sg_name="flipkart-tracker-sg"
        print_status "Creating security group: $sg_name"
        
        sg_id=$(aws ec2 create-security-group --group-name "$sg_name" --description "Security group for Flipkart Price Tracker" --region "$default_region" --query 'GroupId' --output text 2>/dev/null || aws ec2 describe-security-groups --group-names "$sg_name" --region "$default_region" --query 'SecurityGroups[0].GroupId' --output text)
        
        # Add security group rules
        aws ec2 authorize-security-group-ingress --group-id "$sg_id" --protocol tcp --port 22 --cidr 0.0.0.0/0 --region "$default_region" 2>/dev/null || true
        aws ec2 authorize-security-group-ingress --group-id "$sg_id" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$default_region" 2>/dev/null || true
        aws ec2 authorize-security-group-ingress --group-id "$sg_id" --protocol tcp --port 10000 --cidr 0.0.0.0.0 --region "$default_region" 2>/dev/null || true
        
        print_success "Security group created: $sg_id"
        
        # Launch EC2 instance
        print_status "Launching EC2 t2.micro instance..."
        
        instance_id=$(aws ec2 run-instances \
            --image-id ami-0c02fb55956c7d316 \
            --count 1 \
            --instance-type t2.micro \
            --key-name "$key_name" \
            --security-group-ids "$sg_id" \
            --region "$default_region" \
            --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=flipkart-price-tracker}]' \
            --query 'Instances[0].InstanceId' \
            --output text)
        
        print_success "EC2 instance launched: $instance_id"
        
        # Wait for instance to be running
        print_status "Waiting for instance to be running..."
        aws ec2 wait instance-running --instance-ids "$instance_id" --region "$default_region"
        
        # Get public IP
        public_ip=$(aws ec2 describe-instances --instance-ids "$instance_id" --region "$default_region" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
        
        print_success "Instance is running!"
        print_success "Public IP: $public_ip"
        print_success "Key file: ${key_name}.pem"
        
        echo ""
        print_status "Next steps:"
        echo "1. Connect to your instance:"
        echo "   ssh -i ${key_name}.pem ec2-user@$public_ip"
        echo ""
        echo "2. Upload your project:"
        echo "   scp -i ${key_name}.pem -r /Users/yashodip.patil@avalara.com/DC1 ec2-user@$public_ip:/home/ec2-user/flipkart-price-tracker"
        echo ""
        echo "3. Deploy on EC2:"
        echo "   cd flipkart-price-tracker"
        echo "   chmod +x aws-deploy.sh"
        echo "   ./aws-deploy.sh"
        echo ""
        
    fi
    
else
    print_error "AWS authentication failed. Please check your credentials."
    exit 1
fi
