# Railway Deployment (Easiest Option)

## Step 1: Prepare Code
```bash
# Create package.json for Railway
cat > package.json << 'EOF'
{
  "name": "flipkart-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node telegram-bot.js"
  },
  "dependencies": {
    "axios": "^1.11.0",
    "dotenv": "^17.2.2"
  }
}
EOF

# Create Procfile
echo "web: node telegram-bot.js" > Procfile
```

## Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Railway dashboard
6. Deploy automatically

## Step 3: Add Environment Variables
In Railway dashboard, add:
- FLIPKART_AFFILIATE_ID
- FLIPKART_AFFILIATE_TOKEN  
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY
- CHECK_INTERVAL_MIN

✅ **Result**: 24/7 running tracker in 5 minutes!