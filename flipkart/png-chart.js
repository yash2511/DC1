import fs from 'fs';

export function generateTextChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data for chart`;
  }

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  // Create visual price chart using Unicode blocks
  const chartHeight = 12;
  const chartWidth = Math.min(prices.length, 20);
  const displayPrices = prices.slice(-chartWidth);
  
  let chart = `📊 ${title}\n\n`;
  
  // Price range indicators
  chart += `┌${'─'.repeat(chartWidth + 2)}┐\n`;
  chart += `│ Highest: ₹${maxPrice.toLocaleString().padStart(8)} │\n`;
  chart += `│ Current: ₹${currentPrice.toLocaleString().padStart(8)} │\n`;
  chart += `│ Lowest:  ₹${minPrice.toLocaleString().padStart(8)} │\n`;
  chart += `├${'─'.repeat(chartWidth + 2)}┤\n`;
  
  // Chart visualization
  for (let i = chartHeight; i >= 0; i--) {
    const threshold = minPrice + ((maxPrice - minPrice) * i / chartHeight);
    let line = '│';
    
    for (const price of displayPrices) {
      if (price >= threshold) {
        line += '█';
      } else {
        line += ' ';
      }
    }
    line += '│';
    chart += line + '\n';
  }
  
  chart += `└${'─'.repeat(chartWidth + 2)}┘\n`;
  chart += `🟣 Flipkart Price Trend\n\n`;
  
  // Price statistics
  const change = currentPrice - prices[prices.length - 2];
  const changePercent = ((change / prices[prices.length - 2]) * 100).toFixed(1);
  const trend = change > 0 ? '📈 Rising' : change < 0 ? '📉 Falling' : '➡️ Stable';
  
  chart += `${trend} ${change >= 0 ? '+' : ''}₹${change} (${changePercent}%)\n`;
  chart += `📊 ${displayPrices.length} price points tracked`;
  
  return chart;
}

export async function sendEnhancedAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  // Generate text-based chart
  const textChart = generateTextChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📉 All-Time Low: ₹${minPrice.toLocaleString()}
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${textChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending enhanced alert:', error);
    return false;
  }
}