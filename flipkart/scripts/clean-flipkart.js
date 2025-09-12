import axios from "axios";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

async function sendToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
  }
}

async function searchProducts(query) {
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
    
    let message = `🛒 <b>Flipkart Search Results for "${query}"</b>\n\n`;
    
    products.slice(0, 5).forEach((product, index) => {
      const info = product.productBaseInfoV1;
      message += `${index + 1}. <b>${info.title}</b>\n`;
      message += `💰 Price: ₹${info.flipkartSellingPrice.amount}\n`;
      message += `🔥 Special: ₹${info.flipkartSpecialPrice.amount} (${info.discountPercentage}% off)\n`;
      message += `📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}\n`;
      message += `🔗 <a href="${info.productUrl}">Buy Now</a>\n\n`;
    });
    
    await sendToTelegram(message);
    console.log('Results sent to Telegram!');

  } catch (err) {
    console.error("Error:", err.response?.status, err.response?.data || err.message);
  }
}

searchProducts("iphone14");