#!/bin/bash

# Start the price monitor in background
echo "🚀 Starting Flipkart Price Monitor..."

# Kill any existing process and send stop notification
if [ -f monitor.pid ]; then
  OLD_PID=$(cat monitor.pid)
  kill $OLD_PID 2>/dev/null
  /usr/local/bin/node -e "import('./telegram-notify.js').then(m => m.notifyStop())"
  rm monitor.pid
fi

# Start new process in background
nohup /usr/local/bin/node supabase-monitor.js > monitor.log 2>&1 &

# Get the process ID
PID=$!
echo "✅ Monitor started with PID: $PID"
echo "📄 Logs: tail -f monitor.log"
echo "🛑 Stop: ./stop-monitor.sh"

# Save PID for easy stopping
echo $PID > monitor.pid