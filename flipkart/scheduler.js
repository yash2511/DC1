import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const CHECK_INTERVAL_MIN = parseInt(process.env.CHECK_INTERVAL_MIN) || 30;

function runPriceCheck() {
  console.log(`🔍 Running price check at ${new Date().toLocaleString()}`);
  
  exec('node price-tracker.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    if (stderr) {
      console.error('Stderr:', stderr);
      return;
    }
    console.log(stdout);
  });
}

// Run immediately
runPriceCheck();

// Schedule regular checks
setInterval(runPriceCheck, CHECK_INTERVAL_MIN * 60 * 1000);

console.log(`📅 Price tracker started. Checking every ${CHECK_INTERVAL_MIN} minutes.`);