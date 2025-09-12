import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { exec } from 'child_process';
import { generatePriceChart } from './price-chart-generator.js';

dotenv.config({ path: './.env' });

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const mockPriceHistory = [
  { price: 120000, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { price: 89999, recordedAt: new Date() }
];

async function convertSvgToPng(svgFile) {
  return new Promise((resolve, reject) => {
    const pngFile = svgFile.replace('.svg', '.png');
    exec(`convert "${svgFile}" "${pngFile}"`, (error) => {
      if (error) {
        // Try with rsvg-convert if ImageMagick fails
        exec(`rsvg-convert -o "${pngFile}" "${svgFile}"`, (error2) => {
          if (error2) reject(error2);
          else resolve(pngFile);
        });
      } else {
        resolve(pngFile);
      }
    });
  });
}

async function testPngAlert() {
  try {
    const svgFile = generatePriceChart(mockPriceHistory, 'Samsung Galaxy S24 Ultra', 'TEST123');
    const pngFile = await convertSvgToPng(svgFile);
    
    const caption = `🚨 ALL-TIME LOW ALERT! 🚨\n\n📱 Samsung Galaxy S24 Ultra\n\n💰 Current: ₹89,999\n📉 Lowest: ₹89,999`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', fs.createReadStream(pngFile));
    formData.append('caption', caption);
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });
    
    fs.unlinkSync(svgFile);
    fs.unlinkSync(pngFile);
    console.log('✅ PNG chart sent!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPngAlert();