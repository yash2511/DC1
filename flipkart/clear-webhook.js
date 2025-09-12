import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN } = process.env;

async function clearWebhook() {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    console.log('✅ Webhook cleared');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

clearWebhook();