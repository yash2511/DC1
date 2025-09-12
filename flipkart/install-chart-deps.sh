#!/bin/bash

echo "🚀 Installing chart dependencies..."

# Install the new dependencies
npm install form-data@^4.0.0

echo "✅ Chart dependencies installed!"
echo "📊 Price graphs will now be included in Telegram alerts"
echo ""
echo "New features:"
echo "• ASCII charts in alert messages"
echo "• Image charts sent as photos"
echo "• 'charts' command to view price history"
echo ""
echo "Usage:"
echo "• Send 'charts' to your Telegram bot to view price graphs"
echo "• All-time low alerts now include price trend charts"