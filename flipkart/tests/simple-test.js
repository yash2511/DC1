import axios from 'axios';
import dotenv from 'dotenv';
import { generateEnhancedASCIIChart } from './chart-generator.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

async function simpleTest() {
  // Sample price history
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

  const asciiChart = generateEnhancedASCIIChart(sampleHistory, 'iPhone 15 Pro 128GB');
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>iPhone 15 Pro 128GB Natural Titanium</b>

💰 Current Price: ₹1,19,999
🔥 Discount: 20% OFF
📉 All-Time Low: ₹1,19,999
📦 Stock: ✅ Available

<pre>${asciiChart}</pre>

🛒 <a href="https://flipkart.com/test">BUY NOW - Limited Time!</a>`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    console.log('✅ Simple test alert sent successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

simpleTest();