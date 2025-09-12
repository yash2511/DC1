import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Flipkart Price Tracker Running',
    timestamp: new Date().toISOString()
  });
});

// Start price monitoring
app.post('/start-monitoring', async (req, res) => {
  try {
    // Start monitoring logic here
    res.json({ message: 'Price monitoring started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram webhook endpoint
app.post('/webhook', (req, res) => {
  const { message } = req.body;
  if (message) {
    handleTelegramMessage(message);
  }
  res.sendStatus(200);
});

async function handleTelegramMessage(message) {
  const text = message.text?.toLowerCase();
  const chatId = message.chat.id;
  
  if (chatId.toString() !== TELEGRAM_CHAT_ID) return;
  
  let response = '';
  switch (text) {
    case '/start':
      response = '🤖 Flipkart Price Tracker Started!\n\nCommands:\n/status - Check status\n/stop - Stop monitoring';
      break;
    case '/status':
      response = '✅ Price tracker is running on EC2';
      break;
    default:
      response = 'Unknown command. Use /start or /status';
  }
  
  await sendTelegramMessage(chatId, response);
}

async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error('Telegram error:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Flipkart Price Tracker running on port ${PORT}`);
});