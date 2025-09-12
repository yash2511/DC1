import fs from 'fs';

export function generateGraphChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data`;
  }

  const prices = priceHistory.map(p => p.price);
  const dates = priceHistory.map(p => new Date(p.recordedAt));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const chartHeight = 10;
  const chartWidth = 40;
  
  let chart = `📊 ${title}\n\n`;
  
  // Y-axis with price labels
  for (let i = chartHeight; i >= 0; i--) {
    const priceLevel = minPrice + ((maxPrice - minPrice) * i / chartHeight);
    const yLabel = `₹${Math.round(priceLevel).toLocaleString()}`.padStart(8);
    
    let line = `${yLabel} │`;
    
    // Plot price points
    for (let j = 0; j < chartWidth; j++) {
      const dataIndex = Math.floor((j / chartWidth) * prices.length);
      const price = prices[dataIndex] || 0;
      
      if (Math.abs(price - priceLevel) <= (maxPrice - minPrice) / chartHeight) {
        line += '█';
      } else if (price > priceLevel) {
        line += '▄';
      } else {
        line += ' ';
      }
    }
    
    chart += line + '\n';
  }
  
  // X-axis
  chart += '        └' + '─'.repeat(chartWidth) + '\n';
  chart += '         ';
  
  // X-axis labels (months)
  const months = ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Sep'];
  for (let i = 0; i < 6; i++) {
    const pos = Math.floor((i / 5) * chartWidth);
    chart += months[i].padEnd(7);
  }
  
  chart += '\n\n';
  chart += `🟣 Flipkart Price\n\n`;
  chart += `Highest ₹${maxPrice.toLocaleString()}\n`;
  chart += `Current ₹${currentPrice.toLocaleString()}\n`;
  chart += `Lowest  ₹${minPrice.toLocaleString()}`;
  
  return chart;
}

export async function sendGraphAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  const graphChart = generateGraphChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📉 All-Time Low: ₹${minPrice.toLocaleString()}
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${graphChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending graph alert:', error);
    return false;
  }
}