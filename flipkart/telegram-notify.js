import axios from "axios";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

export async function sendTelegramMessage(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
  }
}

export async function notifyStart() {
  const message = `🚀 <b>Price Tracker Started</b>\n\n` +
    `📅 Started at: ${new Date().toLocaleString()}\n` +
    `🔍 Monitoring electronics categories\n` +
    `⏰ Check interval: ${process.env.CHECK_INTERVAL_MIN || 30} minutes\n\n` +
    `💡 You'll get alerts when products hit all-time lows!`;
  
  await sendTelegramMessage(message);
}

export async function notifyStop() {
  const message = `🛑 <b>Price Tracker Stopped</b>\n\n` +
    `📅 Stopped at: ${new Date().toLocaleString()}\n` +
    `⏹️ Monitoring has been paused\n\n` +
    `💤 No more price alerts until restarted`;
  
  await sendTelegramMessage(message);
}