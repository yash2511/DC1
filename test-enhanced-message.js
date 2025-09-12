import { generatePriceChart } from './flipkart/price-chart-generator.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

const sampleData = [
  { price: 11690, recorded_at: '2025-01-01' },
  { price: 11690, recorded_at: '2025-01-02' },
  { price: 11690, recorded_at: '2025-01-03' },
  { price: 11690, recorded_at: '2025-01-04' },
  { price: 11690, recorded_at: '2025-01-05' },
  { price: 11690, recorded_at: '2025-01-06' },
  { price: 11690, recorded_at: '2025-01-07' },
  { price: 11690, recorded_at: '2025-01-08' },
  { price: 11690, recorded_at: '2025-01-09' },
  { price: 11690, recorded_at: '2025-01-10' },
  { price: 10790, recorded_at: '2025-01-11' }
];

async function sendEnhancedAlert() {
  try {
    const title = 'TechLife 7 kg Washing Machine';
    const currentPrice = 10790;
    const minPrice = 10790;
    const maxPrice = 11690;
    const discount = 23;
    const reductionPercent = ((maxPrice - currentPrice) / maxPrice * 100).toFixed(1);
    
    // Enhanced message with all details
    const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨\n\n` +
      `📱 <b>${title}</b>\n\n` +
      `💰 Current Price: ₹${currentPrice.toLocaleString()}\n` +
      `🔥 Discount: ${discount}% OFF\n` +
      `📦 Stock: ✅ Available\n` +
      `📉 Lowest Ever: ₹${minPrice.toLocaleString()}\n` +
      `📈 Highest: ₹${maxPrice.toLocaleString()}\n` +
      `💾 Price Reduction: ${reductionPercent}%\n\n` +
      `💸 You Save: ₹${maxPrice - currentPrice} vs Highest Price\n` +
      `⏰ Alert Time: ${new Date().toLocaleString()}\n\n` +
      `🛒 <a href="https://www.flipkart.com/product">BUY NOW - Limited Time!</a>`;
    
    // Send enhanced message
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    // Generate and send chart
    const chartFile = generatePriceChart(sampleData, title, 'ENHANCED123');
    
    if (chartFile && fs.existsSync(chartFile)) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('document', fs.createReadStream(chartFile));
      formData.append('caption', '📊 Price History Chart with All Details');
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      
      fs.unlinkSync(chartFile);
    }
    
    console.log('✅ Enhanced alert with all details sent!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

sendEnhancedAlert();