#!/bin/bash
# Kill all bot instances
pkill -f "telegram-bot.js" 2>/dev/null
pkill -f "price-tracker" 2>/dev/null
pkill -f "monitor" 2>/dev/null
killall node 2>/dev/null

# Clean up pid files
rm -f bot.pid monitor.pid 2>/dev/null

# Clear webhook
if [ -f .env ]; then
    source .env
    curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook" > /dev/null
fi

echo "✅ All bot instances killed and webhook cleared"