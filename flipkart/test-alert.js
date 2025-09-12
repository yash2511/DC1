import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { generateEnhancedASCIIChart, getPriceHistory } from './chart-generator.js';
import { generateSVGChart } from './simple-chart.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Test alert with sample data
async function testAlert() {
  const sampleProduct = {
    productBaseInfoV1: {
      productId: 'TEST123',
      title: 'iPhone 15 Pro 128GB',
      flipkartSpecialPrice: { amount: 89999 },
      discountPercentage: 15,
      inStock: true,
      productUrl: 'https://flipkart.com/test'
    }
  };

  // Sample price history with dates
  const now = new Date();
  const sampleHistory = [
    {price: 95000, recordedAt: new Date(now - 7*24*60*60*1000).toISOString()}, // 7 days ago
    {price: 94500, recordedAt: new Date(now - 6*24*60*60*1000).toISOString()}, // 6 days ago
    {price: 93800, recordedAt: new Date(now - 5*24*60*60*1000).toISOString()}, // 5 days ago
    {price: 92500, recordedAt: new Date(now - 4*24*60*60*1000).toISOString()}, // 4 days ago
    {price: 91200, recordedAt: new Date(now - 3*24*60*60*1000).toISOString()}, // 3 days ago
    {price: 90800, recordedAt: new Date(now - 2*24*60*60*1000).toISOString()}, // 2 days ago
    {price: 90500, recordedAt: new Date(now - 1*24*60*60*1000).toISOString()}, // 1 day ago
    {price: 89999, recordedAt: now.toISOString()} // today
  ];

  const info = sampleProduct.productBaseInfoV1;
  const asciiChart = generateEnhancedASCIIChart(sampleHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨\n\n` +
    `📱 <b>${info.title}</b>\n\n` +
    `💰 Current Price: ₹${info.flipkartSpecialPrice.amount}\n` +
    `🔥 Discount: ${info.discountPercentage}% OFF\n` +
    `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n\n` +
    `<pre>${asciiChart}</pre>\n\n` +
    `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    // Send text message
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    // Generate and send SVG chart
    const svgChart = generateSVGChart(sampleHistory, info.title, info.productId);
    if (svgChart && fs.existsSync(svgChart)) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('document', fs.createReadStream(svgChart));
      formData.append('caption', `📊 Price History Chart for ${info.title}`);
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      
      fs.unlinkSync(svgChart);
    }
    
    console.log('✅ Test alert sent successfully!');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testAlert();