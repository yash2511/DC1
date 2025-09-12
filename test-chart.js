import { generatePriceChart } from './flipkart/price-chart-generator.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

// Sample price history data
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

async function sendTestChart() {
  try {
    const title = 'TechLife 7 kg 5 Star Rating Fabric Safe Wash Fully Automatic Top Load Washing Machine Black, Grey(RMTTL705N)';
    const chartFile = generatePriceChart(sampleData, title, 'TEST123');
    
    if (chartFile && fs.existsSync(chartFile)) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('document', fs.createReadStream(chartFile));
      formData.append('caption', '📊 Sample User-Friendly Price Chart');
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      
      fs.unlinkSync(chartFile);
      console.log('✅ Sample chart sent to Telegram!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

sendTestChart();