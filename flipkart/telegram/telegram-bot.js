import axios from 'axios';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { generateEnhancedASCIIChart, getPriceHistory } from './chart-generator.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
const BOT_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let offset = 0;

// Load database
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync('./price-tracker-db.json', 'utf8'));
  } catch {
    return { products: {}, priceHistory: [] };
  }
}

// Send message to Telegram
async function sendMessage(text) {
  try {
    await axios.post(`${BOT_URL}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Send message error:', err.response?.data || err.message);
  }
}

// Send photo to Telegram
async function sendPhoto(imagePath, caption) {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', fs.createReadStream(imagePath));
    formData.append('caption', caption);
    
    await axios.post(`${BOT_URL}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });
  } catch (err) {
    console.error('Send photo error:', err.response?.data || err.message);
  }
}

// Show price charts for recent products
async function showPriceCharts() {
  const db = loadDB();
  const products = Object.entries(db.products).slice(0, 5); // Show top 5 products
  
  if (products.length === 0) {
    await sendMessage('📊 <b>No Price Data Available</b>\n\nStart monitoring some products first!');
    return;
  }
  
  await sendMessage('📊 <b>Generating Price Charts...</b>\n\nPlease wait...');
  
  for (const [productId, product] of products) {
    const priceHistory = getPriceHistory(db, productId);
    
    if (priceHistory.length >= 2) {
      const asciiChart = generateEnhancedASCIIChart(priceHistory, product.title);
      await sendMessage(`<pre>${asciiChart}</pre>`);
    }
  }
}

// Start price tracker
function startTracker() {
  return new Promise((resolve) => {
    exec('bash start-monitor.sh', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error('Start error:', error.message);
        resolve(false);
      } else {
        console.log('Tracker started:', stdout);
        resolve(true);
      }
    });
  });
}

// Stop price tracker
function stopTracker() {
  return new Promise((resolve) => {
    exec('bash stop-monitor.sh', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error('Stop error:', error.message);
        resolve(false);
      } else {
        console.log('Tracker stopped:', stdout);
        resolve(true);
      }
    });
  });
}

// Check tracker status
function isTrackerRunning() {
  try {
    if (fs.existsSync('./monitor.pid')) {
      const pid = fs.readFileSync('./monitor.pid', 'utf8').trim();
      // Check if process is actually running
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Process incoming messages
async function processMessage(message) {
  const text = message.text?.toLowerCase().trim();
  const chatId = message.chat.id.toString();
  
  // Only respond to authorized chat
  if (chatId !== TELEGRAM_CHAT_ID) {
    return;
  }
  
  console.log(`Received command: ${text}`);
  
  switch (text) {
    case '/start':
    case 'start':
      if (isTrackerRunning()) {
        await sendMessage('🟢 <b>Tracker Already Running</b>\n\nPrice monitoring is already active!');
      } else {
        await sendMessage('🚀 <b>Starting Price Tracker...</b>\n\nPlease wait...');
        const started = await startTracker();
        if (started) {
          await sendMessage('✅ <b>Price Tracker Started!</b>\n\n📊 Monitoring electronics for all-time lows\n⏰ Checking every 30 minutes');
        } else {
          await sendMessage('❌ <b>Failed to Start Tracker</b>\n\nPlease check the logs');
        }
      }
      break;
      
    case '/stop':
    case 'stop':
      if (!isTrackerRunning()) {
        await sendMessage('🔴 <b>Tracker Already Stopped</b>\n\nPrice monitoring is not running');
      } else {
        await sendMessage('🛑 <b>Stopping Price Tracker...</b>\n\nPlease wait...');
        const stopped = await stopTracker();
        if (stopped) {
          await sendMessage('✅ <b>Price Tracker Stopped!</b>\n\n💤 Monitoring has been paused');
        } else {
          await sendMessage('❌ <b>Failed to Stop Tracker</b>\n\nPlease check the logs');
        }
      }
      break;
      
    case '/status':
    case 'status':
      const running = isTrackerRunning();
      const status = running ? '🟢 <b>RUNNING</b>' : '🔴 <b>STOPPED</b>';
      await sendMessage(`📊 <b>Tracker Status</b>\n\n${status}\n\nCommands:\n• <code>start</code> - Start monitoring\n• <code>stop</code> - Stop monitoring\n• <code>status</code> - Check status\n• <code>charts</code> - View price charts`);
      break;
      
    case '/charts':
    case 'charts':
      await showPriceCharts();
      break;
      
    default:
      await sendMessage('❓ <b>Unknown Command</b>\n\nAvailable commands:\n• <code>start</code> - Start price tracker\n• <code>stop</code> - Stop price tracker\n• <code>status</code> - Check status\n• <code>charts</code> - View price charts');
  }
}

// Clear webhook on startup
async function clearWebhook() {
  try {
    await axios.post(`${BOT_URL}/deleteWebhook`);
    console.log('✅ Webhook cleared');
  } catch (err) {
    console.log('Webhook clear attempt:', err.response?.status || err.message);
  }
}

// Poll for messages
async function pollMessages() {
  try {
    const response = await axios.get(`${BOT_URL}/getUpdates`, {
      params: { offset: offset + 1, timeout: 10 }
    });
    
    const updates = response.data.result;
    
    for (const update of updates) {
      if (update.message) {
        await processMessage(update.message);
      }
      offset = update.update_id;
    }
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('⚠️  Conflict detected - clearing webhook and retrying...');
      await clearWebhook();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    } else {
      console.error('Poll error:', err.response?.status || err.message);
    }
  }
}

// Start bot
async function startBot() {
  console.log('🤖 Starting Telegram bot...');
  
  // Clear any existing webhook first
  await clearWebhook();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('📱 Send "start" or "stop" to control the price tracker');
  
  // Initial status message
  await sendMessage('🤖 <b>Control Bot Online</b>\n\nSend commands:\n• <code>start</code> - Start price tracker\n• <code>stop</code> - Stop price tracker\n• <code>status</code> - Check status\n• <code>charts</code> - View price charts');
  
  // Poll for messages every 3 seconds
  setInterval(pollMessages, 3000);
}

startBot();