import { generatePriceChart } from './flipkart/price-chart-generator.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

const sampleData = [
  { price: 11690, recorded_at: '2025-01-01T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-02T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-03T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-04T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-05T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-06T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-07T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-08T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-09T10:00:00Z' },
  { price: 11690, recorded_at: '2025-01-10T10:00:00Z' },
  { price: 10790, recorded_at: '2025-01-11T10:00:00Z' }
];

async function sendDateChart() {
  try {
    const title = 'TechLife Washing Machine - With Dates';
    const chartFile = generatePriceChart(sampleData, title, 'DATETEST123');
    
    if (chartFile && fs.existsSync(chartFile)) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('document', fs.createReadStream(chartFile));
      formData.append('caption', '📊 Enhanced Chart with Complete Date Information');
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
        headers: formData.getHeaders()
      });
      
      fs.unlinkSync(chartFile);
      console.log('✅ Chart with dates sent!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

sendDateChart();