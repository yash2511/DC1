import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { generatePriceChart } from './price-chart-generator.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Mock product data for testing
const mockProduct = {
  productBaseInfoV1: {
    productId: 'TEST123',
    title: 'Test Product - Samsung Galaxy S24 Ultra 256GB',
    flipkartSpecialPrice: { amount: 89999 },
    discountPercentage: 25,
    inStock: true,
    productUrl: 'https://flipkart.com/test'
  }
};

// Mock price history data
const mockPriceHistory = [
  { price: 120000, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { price: 115000, recordedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
  { price: 110000, recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  { price: 105000, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { price: 95000, recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { price: 89999, recordedAt: new Date() }
];

async function testChartAlert() {
  try {
    const info = mockProduct.productBaseInfoV1;
    
    // Generate chart
    const chartFile = generatePriceChart(mockPriceHistory, info.title, info.productId);
    
    if (chartFile && fs.existsSync(chartFile)) {
      console.log('✅ Chart generated:', chartFile);
      
      // Calculate stats
      const prices = mockPriceHistory.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const reductionPercent = (((maxPrice - minPrice) / maxPrice) * 100).toFixed(1);
      
      // Send to Telegram
      const caption = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨\n\n` +
        `📱 <b>${info.title}</b>\n\n` +
        `💰 Current Price: ₹${info.flipkartSpecialPrice.amount.toLocaleString()}\n` +
        `🔥 Discount: ${info.discountPercentage}% OFF\n` +
        `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n` +
        `📉 Lowest Ever: ₹${minPrice.toLocaleString()}\n` +
        `📈 Highest: ₹${maxPrice.toLocaleString()}\n` +
        `💾 Price Reduction: ${reductionPercent}%\n\n` +
        `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;
      
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', fs.createReadStream(chartFile));
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
        headers: formData.getHeaders()
      });
      
      console.log('✅ Alert with chart sent to Telegram!');
      
      // Clean up
      fs.unlinkSync(chartFile);
      console.log('✅ Chart file cleaned up');
      
    } else {
      console.log('❌ Chart generation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChartAlert();