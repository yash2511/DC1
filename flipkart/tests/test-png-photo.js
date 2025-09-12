import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { generatePngChart } from './png-chart-generator.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const mockPriceHistory = [
  { price: 120000, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { price: 115000, recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  { price: 89999, recordedAt: new Date() }
];

async function testPngPhoto() {
  try {
    const chartFile = generatePngChart(mockPriceHistory, 'Samsung Galaxy S24 Ultra 256GB', 'TEST123');
    
    const caption = `🚨 ALL-TIME LOW ALERT! 🚨\n\n📱 Samsung Galaxy S24 Ultra 256GB\n\n💰 Current: ₹89,999\n🔥 Discount: 25% OFF\n📉 Lowest: ₹89,999`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', fs.createReadStream(chartFile));
    formData.append('caption', caption);
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });
    
    fs.unlinkSync(chartFile);
    console.log('✅ PNG chart photo sent!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPngPhoto();