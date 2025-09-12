import axios from 'axios';
import { spawn, exec } from 'child_process';
import fs from 'fs';
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

// Send message
async function sendMessage(text) {
  try {
    await axios.post(`${BOT_URL}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Send error:', err.message);
  }
}

// Show charts
async function showCharts() {
  const db = loadDB();
  const products = Object.entries(db.products).slice(0, 3);
  
  if (products.length === 0) {
    await sendMessage('📊 No price data available');
    return;
  }
  
  for (const [productId, product] of products) {
    const priceHistory = getPriceHistory(db, productId);
    if (priceHistory.length >= 2) {
      const chart = generateEnhancedASCIIChart(priceHistory, product.title);
      await sendMessage(`<pre>${chart}</pre>`);
    }
  }
}

// Process messages
async function processMessage(message) {
  const text = message.text?.toLowerCase().trim();
  const chatId = message.chat.id.toString();
  
  if (chatId !== TELEGRAM_CHAT_ID) return;
  
  console.log(`Command: ${text}`);
  
  switch (text) {
    case 'charts':
      await showCharts();
      break;
    case 'status':
      await sendMessage('🤖 Bot is running\n\nCommands:\n• charts - View price charts');
      break;
    default:
      await sendMessage('Available commands:\n• charts\n• status');
  }
}

// Simple polling
async function poll() {
  try {
    const response = await axios.get(`${BOT_URL}/getUpdates`, {
      params: { offset: offset + 1, timeout: 5 }
    });
    
    const updates = response.data.result;
    for (const update of updates) {
      if (update.message) {
        await processMessage(update.message);
      }
      offset = update.update_id;
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

console.log('🤖 Simple bot started');
await sendMessage('🤖 Simple Bot Online\n\nCommands:\n• charts - View price charts\n• status - Check status');

setInterval(poll, 3000);