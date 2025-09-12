import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { generateEnhancedSVGChart, sendAllTimeLowAlert } from './enhanced-chart.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Telegram bot helper
const telegramBot = {
  async sendMessage(message) {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
  },
  
  async sendPhoto(filePath, caption) {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', fs.createReadStream(filePath));
    formData.append('caption', caption);
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });
  }
};

async function testEnhancedAlert() {
  // Sample product data
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

  // Sample price history showing decline to all-time low
  const now = new Date();
  const sampleHistory = [
    {price: 139999, recordedAt: new Date(now - 30*24*60*60*1000).toISOString()}, // 30 days ago
    {price: 135999, recordedAt: new Date(now - 25*24*60*60*1000).toISOString()}, // 25 days ago
    {price: 132999, recordedAt: new Date(now - 20*24*60*60*1000).toISOString()}, // 20 days ago
    {price: 129999, recordedAt: new Date(now - 15*24*60*60*1000).toISOString()}, // 15 days ago
    {price: 127999, recordedAt: new Date(now - 12*24*60*60*1000).toISOString()}, // 12 days ago
    {price: 125999, recordedAt: new Date(now - 10*24*60*60*1000).toISOString()}, // 10 days ago
    {price: 124999, recordedAt: new Date(now - 8*24*60*60*1000).toISOString()},  // 8 days ago
    {price: 123999, recordedAt: new Date(now - 6*24*60*60*1000).toISOString()},  // 6 days ago
    {price: 122999, recordedAt: new Date(now - 4*24*60*60*1000).toISOString()},  // 4 days ago
    {price: 121999, recordedAt: new Date(now - 2*24*60*60*1000).toISOString()},  // 2 days ago
    {price: 119999, recordedAt: now.toISOString()} // today - ALL TIME LOW!
  ];

  console.log('🚀 Testing enhanced all-time low alert...');
  
  try {
    const success = await sendAllTimeLowAlert(sampleProduct, sampleHistory, telegramBot);
    
    if (success) {
      console.log('✅ Enhanced all-time low alert sent successfully!');
      console.log('📊 Chart includes:');
      console.log('   - Price history graph matching your screenshot style');
      console.log('   - Highest price line (green dashed)');
      console.log('   - Current price line (blue dashed)');
      console.log('   - Lowest price line (red dashed)');
      console.log('   - Gradient fill under price curve');
      console.log('   - Month labels on X-axis');
      console.log('   - Price labels on Y-axis');
    } else {
      console.log('❌ Failed to send alert');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEnhancedAlert();