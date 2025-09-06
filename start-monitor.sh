#!/bin/bash
echo "🚀 Starting Flipkart Price Monitor..."
cd flipkart
nohup node continuous-monitor.js > monitor.log 2>&1 &
echo $! > monitor.pid
echo "✅ Monitor started! Check monitor.log for output"
echo "📱 Your app will keep running even if you close the browser"