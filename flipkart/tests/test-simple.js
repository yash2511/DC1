import axios from 'axios';
import dotenv from 'dotenv';
import { sendSimpleAlert } from './simple-chart.js';

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

async function testSimpleChart() {
  const sampleProduct = {
    productBaseInfoV1: {
      productId: 'TEST123',
      title: 'iPhone 15 Pro 128GB',
      flipkartSpecialPrice: { amount: 89999 },
      discountPercentage: 25,
      inStock: true,
      productUrl: 'https://flipkart.com/test'
    }
  };

  const sampleHistory = [
    {price: 119999, recordedAt: '2024-01-01'},
    {price: 89999, recordedAt: '2024-11-01'}
  ];

  console.log('🚀 Testing simple bar chart...');
  
  const success = await sendSimpleAlert(sampleProduct, sampleHistory, telegramBot);
  
  if (success) {
    console.log('✅ Simple chart sent successfully!');
  } else {
    console.log('❌ Failed to send alert');
  }
}

testSimpleChart();