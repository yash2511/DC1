import axios from 'axios';
import dotenv from 'dotenv';
import { sendEnhancedAlert } from './png-chart.js';

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

async function finalTest() {
  const sampleProduct = {
    productBaseInfoV1: {
      productId: 'TEST123',
      title: 'iPhone 15 Pro 128GB Natural Titanium',
      flipkartSpecialPrice: { amount: 119999 },
      discountPercentage: 20,
      inStock: true,
      productUrl: 'https://flipkart.com/test'
    }
  };

  const now = new Date();
  const sampleHistory = [
    {price: 139999, recordedAt: new Date(now - 30*24*60*60*1000).toISOString()},
    {price: 135999, recordedAt: new Date(now - 25*24*60*60*1000).toISOString()},
    {price: 132999, recordedAt: new Date(now - 20*24*60*60*1000).toISOString()},
    {price: 129999, recordedAt: new Date(now - 15*24*60*60*1000).toISOString()},
    {price: 127999, recordedAt: new Date(now - 12*24*60*60*1000).toISOString()},
    {price: 125999, recordedAt: new Date(now - 10*24*60*60*1000).toISOString()},
    {price: 124999, recordedAt: new Date(now - 8*24*60*60*1000).toISOString()},
    {price: 123999, recordedAt: new Date(now - 6*24*60*60*1000).toISOString()},
    {price: 122999, recordedAt: new Date(now - 4*24*60*60*1000).toISOString()},
    {price: 121999, recordedAt: new Date(now - 2*24*60*60*1000).toISOString()},
    {price: 119999, recordedAt: now.toISOString()}
  ];

  console.log('🚀 Testing final enhanced alert...');
  
  const success = await sendEnhancedAlert(sampleProduct, sampleHistory, telegramBot);
  
  if (success) {
    console.log('✅ Enhanced all-time low alert sent successfully!');
    console.log('📊 Features included:');
    console.log('   - Price trend visualization');
    console.log('   - Highest/Current/Lowest price indicators');
    console.log('   - Unicode block chart');
    console.log('   - Price change statistics');
  } else {
    console.log('❌ Failed to send alert');
  }
}

finalTest();