import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { generateSimplePngChart } from './simple-png-chart.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const mockPriceHistory = [
  { price: 120000, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { price: 89999, recordedAt: new Date() }
];

async function testSimplePhoto() {
  try {
    const chartFile = generateSimplePngChart(mockPriceHistory, 'Samsung Galaxy S24 Ultra', 'TEST123');
    
    const caption = `🚨 ALL-TIME LOW ALERT! 🚨\n\n📱 Samsung Galaxy S24 Ultra\n\n💰 Current: ₹89,999`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', fs.createReadStream(chartFile));
    formData.append('caption', caption);
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });
    
    fs.unlinkSync(chartFile);
    console.log('✅ Simple chart photo sent!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimplePhoto();