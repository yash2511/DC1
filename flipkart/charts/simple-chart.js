export function generateSimpleChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data`;
  }

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const totalDrop = firstPrice - currentPrice;
  const dropPercent = ((totalDrop / firstPrice) * 100).toFixed(1);
  
  let chart = `📊 ${title}\n\n`;
  
  // Simple bar chart showing price drop
  chart += `Price Trend (Last 6 months):\n\n`;
  chart += `₹${firstPrice.toLocaleString()}  ████████████████████ (Start)\n`;
  chart += `₹${Math.round((firstPrice + currentPrice) / 2).toLocaleString()}  ████████████\n`;
  chart += `₹${currentPrice.toLocaleString()}  ████████ (Current - ALL TIME LOW!)\n\n`;
  
  // Savings highlight
  chart += `💰 YOUR SAVINGS:\n`;
  chart += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  chart += `💸 Was: ₹${firstPrice.toLocaleString()}\n`;
  chart += `💵 Now: ₹${currentPrice.toLocaleString()}\n`;
  chart += `🎉 Saved: ₹${totalDrop.toLocaleString()} (${dropPercent}% OFF)\n`;
  chart += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  chart += `📈 Status: 📉 FALLING PRICES\n`;
  chart += `🟣 Flipkart Price Alert`;
  
  return chart;
}

export async function sendSimpleAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  
  const simpleChart = generateSimpleChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${simpleChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Best Deal Ever!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending simple alert:', error);
    return false;
  }
}