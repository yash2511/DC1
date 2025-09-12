import axios from "axios";
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import { initDB, upsertProduct, addPriceRecord, cleanupOldRecords } from './supabase-database.js';
import { generatePriceChart } from './price-chart-generator.js';
import { getPriceStatistics } from './supabase-chart-integration.js';

dotenv.config({ path: './.env' });

const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Send Telegram alert with chart
async function sendAlert(product) {
  const info = product.productBaseInfoV1;
  const productId = info.productId;
  
  try {
    // Get price statistics from Supabase only
    const stats = await getPriceStatistics(productId);
    
    if (stats && stats.priceHistory.length >= 2) {
      // Generate chart from Supabase data
      const chartFile = generatePriceChart(stats.priceHistory, info.title, productId);
      
      if (chartFile && fs.existsSync(chartFile)) {
        // Send chart with alert message
        const caption = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨\n\n` +
          `📱 <b>${info.title}</b>\n\n` +
          `💰 Current Price: ₹${info.flipkartSpecialPrice.amount.toLocaleString()}\n` +
          `🔥 Discount: ${info.discountPercentage}% OFF\n` +
          `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n` +
          `📉 Lowest Ever: ₹${stats.minPrice.toLocaleString()}\n` +
          `📈 Highest: ₹${stats.maxPrice.toLocaleString()}\n` +
          `💾 Price Reduction: ${stats.reductionPercent}%\n\n` +
          `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;
        
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('document', fs.createReadStream(chartFile));
        formData.append('caption', 'Price History Chart');
        formData.append('parse_mode', 'HTML');
        
        // Enhanced message with all details
        const textMessage = `🚨 <b>PRICE DROP ALERT!</b> 🚨\n\n` +
          `📱 <b>${info.title}</b>\n\n` +
          `💰 Current Price: ₹${info.flipkartSpecialPrice.amount.toLocaleString()}\n` +
          `🔥 Discount: ${info.discountPercentage}% OFF\n` +
          `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n` +
          `📉 Lowest Ever: ₹${stats.minPrice.toLocaleString()}\n` +
          `📈 Highest: ₹${stats.maxPrice.toLocaleString()}\n` +
          `💾 Price Reduction: ${stats.reductionPercent}%\n\n` +
          `💸 You Save: ₹${(stats.maxPrice - info.flipkartSpecialPrice.amount).toLocaleString()} vs Highest Price\n` +
          `⏰ Alert Time: ${new Date().toLocaleString()}\n` +
          `📊 Chart: Price history with trend analysis\n\n` +
          `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;
        
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text: textMessage,
          parse_mode: 'HTML'
        });
        
        // Send chart as document
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
          headers: formData.getHeaders()
        });
        
        // Clean up chart file
        fs.unlinkSync(chartFile);
        console.log(`Alert with chart sent for: ${info.title}`);
        return;
      }
    }
    
    // Fallback to enhanced text-only alert
    const message = `🚨 <b>PRICE DROP ALERT!</b> 🚨\n\n` +
      `📱 <b>${info.title}</b>\n\n` +
      `💰 Current Price: ₹${info.flipkartSpecialPrice.amount.toLocaleString()}\n` +
      `🔥 Discount: ${info.discountPercentage}% OFF\n` +
      `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n` +
      `📉 Lowest Ever: ₹${info.flipkartSpecialPrice.amount.toLocaleString()}\n` +
      `📈 Highest: Not Available\n` +
      `💾 Price Reduction: New Low!\n\n` +
      `⏰ Alert Time: ${new Date().toLocaleString()}\n\n` +
      `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log(`Text alert sent for: ${info.title}`);
    
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
  }
}

// Check products for all-time lows
async function checkPrices(queries) {
  await initDB();
  
  for (const query of queries) {
    try {
      const resp = await axios.get(
        `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${query}&resultType=all`,
        {
          headers: {
            "Fk-Affiliate-Id": FLIPKART_AFFILIATE_ID,
            "Fk-Affiliate-Token": FLIPKART_AFFILIATE_TOKEN
          }
        }
      );

      const products = resp.data.products || [];
      
      for (const product of products.slice(0, 10)) {
        const info = product.productBaseInfoV1;
        const productId = info.productId;
        const currentPrice = info.flipkartSpecialPrice.amount;
        
        // Add price record to database
        await addPriceRecord(productId, currentPrice);
        
        // Add price record and check for significant reduction
        await upsertProduct(productId, info.title, currentPrice);
        
        // Get price statistics to check reduction percentage
        const stats = await getPriceStatistics(productId);
        
        if (stats && stats.reductionPercent >= 2) {
          console.log(`🚨 PRICE DROP ALERT: ${info.title} - ${stats.reductionPercent}% reduction`);
          await sendAlert(product);
        }
      }
      
    } catch (err) {
      console.error(`Error checking ${query}:`, err.message);
    }
  }
  
  // Cleanup old records (keep last 50 per product)
  await cleanupOldRecords();
}

// Load categories and brands from JSON file
function loadMonitoringConfig() {
  try {
    return JSON.parse(fs.readFileSync('./products.json', 'utf8'));
  } catch (err) {
    console.error('Error loading products.json:', err.message);
    return { categories: [], brands: [] };
  }
}

// Generate search queries from categories and brands
function generateSearchQueries(config) {
  const queries = [];
  
  queries.push(...config.categories);
  queries.push(...config.brands);
  
  config.brands.forEach(brand => {
    ['mobile', 'laptop', 'tv', 'headphones'].forEach(category => {
      queries.push(`${brand} ${category}`);
    });
  });
  
  return queries;
}

// Run price check
async function main() {
  const config = loadMonitoringConfig();
  const searchQueries = generateSearchQueries(config);

  if (searchQueries.length > 0) {
    console.log(`Monitoring ${searchQueries.length} search queries across electronics categories`);
    await checkPrices(searchQueries);
  } else {
    console.log('No categories to monitor. Update products.json');
  }
}

main().catch(console.error);