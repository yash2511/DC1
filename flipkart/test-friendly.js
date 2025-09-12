import axios from 'axios';
import dotenv from 'dotenv';
import { sendUserFriendlyAlert } from './user-friendly-chart.js';

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

async function testFriendlyChart() {
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
    {price: 115999, recordedAt: '2024-02-01'},
    {price: 112999, recordedAt: '2024-03-01'},
    {price: 109999, recordedAt: '2024-04-01'},
    {price: 105999, recordedAt: '2024-05-01'},
    {price: 102999, recordedAt: '2024-06-01'},
    {price: 99999, recordedAt: '2024-07-01'},
    {price: 96999, recordedAt: '2024-08-01'},
    {price: 93999, recordedAt: '2024-09-01'},
    {price: 91999, recordedAt: '2024-10-01'},
    {price: 89999, recordedAt: '2024-11-01'}
  ];

  console.log('🚀 Testing user-friendly price reduction chart...');
  
  const success = await sendUserFriendlyAlert(sampleProduct, sampleHistory, telegramBot);
  
  if (success) {
    console.log('✅ User-friendly chart sent successfully!');
    console.log('📊 Features:');
    console.log('   - Visual price drop indication');
    console.log('   - Savings calculation');
    console.log('   - Trend analysis');
    console.log('   - Clear price reduction summary');
  } else {
    console.log('❌ Failed to send alert');
  }
}

testFriendlyChart();