#!/bin/bash

echo "🛑 Stopping Flipkart Price Monitor..."

# Send stop notification to Telegram
/usr/local/bin/node -e "import('./telegram-notify.js').then(m => m.notifyStop())"

# Kill the process if PID file exists
if [ -f monitor.pid ]; then
  PID=$(cat monitor.pid)
  kill $PID 2>/dev/null
  rm monitor.pid
  echo "✅ Monitor stopped (PID: $PID)"
else
  # Try to kill by process name
  pkill -f "continuous-monitor.js" 2>/dev/null
  echo "✅ Monitor processes stopped"
fi

echo "💤 Price tracking has been stopped"