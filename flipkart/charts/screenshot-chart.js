export function generateScreenshotChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data`;
  }

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const chartHeight = 8;
  const chartWidth = 50;
  
  let chart = `\n`;
  
  // Top price line with labels
  chart += `₹2,500\n`;
  chart += `\n`;
  chart += `       Highest ₹${maxPrice.toLocaleString()}                    Current Price ₹${currentPrice.toLocaleString()}\n`;
  chart += `₹2,000 ┌${'─'.repeat(chartWidth)}┐\n`;
  
  // Price area with line chart
  for (let i = chartHeight; i >= 0; i--) {
    const priceLevel = minPrice + ((maxPrice - minPrice) * i / chartHeight);
    let line = '';
    
    if (i === Math.floor(chartHeight * 0.75)) line = '₹1,500 │';
    else if (i === Math.floor(chartHeight * 0.25)) line = '₹1,000 │';
    else line = '       │';
    
    // Draw price line
    for (let j = 0; j < chartWidth; j++) {
      const dataIndex = Math.floor((j / chartWidth) * prices.length);
      const price = prices[dataIndex] || minPrice;
      const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
      const normalizedLevel = i / chartHeight;
      
      if (Math.abs(normalizedPrice - normalizedLevel) < 0.1) {
        line += '█';
      } else if (normalizedPrice > normalizedLevel) {
        line += '▄';
      } else {
        line += ' ';
      }
    }
    line += '│';
    chart += line + '\n';
  }
  
  // Bottom with lowest price
  chart += `       └${'─'.repeat(chartWidth)}┘\n`;
  chart += `       Lowest ₹${minPrice.toLocaleString()}\n`;
  chart += `₹500\n`;
  chart += `\n`;
  chart += `₹0\n`;
  
  // X-axis months
  chart += `        Nov 1    Jan 1    Mar 1    May 1    Jul 1    Sep 1    Nov 1    Jan 1    Mar 1    May 1\n`;
  chart += `\n`;
  chart += `                                    🟣 Flipkart Price\n`;
  
  return chart;
}

export async function sendScreenshotAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  const screenshotChart = generateScreenshotChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📉 All-Time Low: ₹${minPrice.toLocaleString()}
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${screenshotChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending screenshot alert:', error);
    return false;
  }
}