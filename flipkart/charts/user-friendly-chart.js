export function generateUserFriendlyChart(priceHistory, title) {
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
  
  // Simple price chart
  chart += `₹${maxPrice.toLocaleString()} ┌─────────────────────────────────────┐\n`;
  chart += `       │                                     │\n`;
  chart += `       │    ●─────●─────●─────●─────●─────●  │\n`;
  chart += `       │     ╲     ╲     ╲     ╲     ╲     ╲ │\n`;
  chart += `       │      ╲     ╲     ╲     ╲     ╲     ╲│\n`;
  chart += `₹${currentPrice.toLocaleString()} └─────────────────────────────────────┘\n`;
  chart += `       Jan   Mar   May   Jul   Sep   Nov\n\n`;
  
  // Clear savings info
  chart += `💰 PRICE DROP ANALYSIS:\n`;
  chart += `┌─────────────────────────────────────┐\n`;
  chart += `│ Started: ₹${firstPrice.toLocaleString().padEnd(8)} │ Current: ₹${currentPrice.toLocaleString().padEnd(8)} │\n`;
  chart += `│ You SAVED: ₹${totalDrop.toLocaleString()} (${dropPercent}% OFF)     │\n`;
  chart += `│ Status: 📉 ALL-TIME LOW REACHED!    │\n`;
  chart += `└─────────────────────────────────────┘\n\n`;
  
  chart += `🟣 Flipkart Price Tracker`;
  
  return chart;
}

export async function sendUserFriendlyAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  const userChart = generateUserFriendlyChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${userChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Best Price Ever!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending user-friendly alert:', error);
    return false;
  }
}