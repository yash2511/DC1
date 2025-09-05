import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { notifyStart } from './telegram-notify.js';

dotenv.config({ path: './.env' });

const CHECK_INTERVAL_MIN = parseInt(process.env.CHECK_INTERVAL_MIN) || 30;

function runPriceCheck() {
  const now = new Date().toLocaleString();
  console.log(`\n🔍 [${now}] Starting price check...`);
  
  const child = spawn('/usr/local/bin/node', ['price-tracker-supabase.js'], { 
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ [${new Date().toLocaleString()}] Price check completed`);
    } else {
      console.error(`❌ [${new Date().toLocaleString()}] Price check failed with code ${code}`);
    }
    
    console.log(`⏰ Next check in ${CHECK_INTERVAL_MIN} minutes...\n`);
  });
  
  child.on('error', (error) => {
    console.error('❌ Failed to start price check:', error.message);
  });
}

async function startMonitor() {
  console.log(`🚀 Supabase price monitor started`);
  console.log(`📅 Checking every ${CHECK_INTERVAL_MIN} minutes`);
  console.log(`📱 Alerts will be sent to Telegram when all-time lows are found\n`);

  // Notify start via Telegram
  await notifyStart();

  runPriceCheck();

  // Schedule regular checks
  setInterval(runPriceCheck, CHECK_INTERVAL_MIN * 60 * 1000);
}

startMonitor();