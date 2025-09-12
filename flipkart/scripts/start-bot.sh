#!/bin/bash

echo "🤖 Starting Telegram Control Bot..."

# Kill any existing bot process
pkill -f "telegram-bot.js" 2>/dev/null

# Start bot in background
nohup /usr/local/bin/node telegram-bot.js > bot.log 2>&1 &

# Get the process ID
PID=$!
echo "✅ Bot started with PID: $PID"
echo "📱 Send 'start' or 'stop' messages to your Telegram bot"
echo "📄 Bot logs: tail -f bot.log"
echo "🛑 Stop bot: pkill -f telegram-bot.js"

# Save PID for easy stopping
echo $PID > bot.pid