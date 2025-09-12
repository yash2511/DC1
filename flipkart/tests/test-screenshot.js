import axios from 'axios';
import dotenv from 'dotenv';
import { sendScreenshotAlert } from './screenshot-chart.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const telegramBot = {
  async sendMessage(message) {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
  }
};

async function testScreenshot() {
  const sampleProduct = {
    productBaseInfoV1: {
      productId: 'TEST123',
      title: 'iPhone 15 Pro 128GB',
      flipkartSpecialPrice: { amount: 1999 },
      discountPercentage: 20,
      inStock: true,
      productUrl: 'https://flipkart.com/test'
    }
  };

  const now = new Date();
  const sampleHistory = [
    {price: 1999, recordedAt: new Date(now - 30*24*60*60*1000).toISOString()},
    {price: 1950, recordedAt: new Date(now - 25*24*60*60*1000).toISOString()},
    {price: 1900, recordedAt: new Date(now - 20*24*60*60*1000).toISOString()},
    {price: 1850, recordedAt: new Date(now - 15*24*60*60*1000).toISOString()},
    {price: 1800, recordedAt: new Date(now - 12*24*60*60*1000).toISOString()},
    {price: 1750, recordedAt: new Date(now - 10*24*60*60*1000).toISOString()},
    {price: 1700, recordedAt: new Date(now - 8*24*60*60*1000).toISOString()},
    {price: 1650, recordedAt: new Date(now - 6*24*60*60*1000).toISOString()},
    {price: 1600, recordedAt: new Date(now - 4*24*60*60*1000).toISOString()},
    {price: 1550, recordedAt: new Date(now - 2*24*60*60*1000).toISOString()},
    {price: 999, recordedAt: now.toISOString()}
  ];

  console.log('🚀 Testing screenshot-style chart...');
  
  const success = await sendScreenshotAlert(sampleProduct, sampleHistory, telegramBot);
  
  if (success) {
    console.log('✅ Screenshot-style chart sent successfully!');
  } else {
    console.log('❌ Failed to send alert');
  }
}

testScreenshot();