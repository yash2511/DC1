import axios from "axios";
import dotenv from 'dotenv';
import fs from 'fs';
import { initDB, upsertProduct, addPriceRecord, cleanupOldRecords } from './supabase-database.js';

dotenv.config({ path: './.env' });

const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Send Telegram alert
async function sendAlert(product) {
  const info = product.productBaseInfoV1;
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨\n\n` +
    `📱 <b>${info.title}</b>\n\n` +
    `💰 Current Price: ₹${info.flipkartSpecialPrice.amount}\n` +
    `🔥 Discount: ${info.discountPercentage}% OFF\n` +
    `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n\n` +
    `🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log(`Alert sent for: ${info.title}`);
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
        
        // Check if this is an all-time low
        const isNewLow = await upsertProduct(productId, info.title, currentPrice);
        
        if (isNewLow) {
          console.log(`🚨 ALL-TIME LOW: ${info.title} - ₹${currentPrice}`);
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