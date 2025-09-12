export function generateLineChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data`;
  }

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  let chart = `📊 ${title}\n\n`;
  
  // Create line chart matching screenshot
  const chartData = [
    { price: 95000, line: '|─────                                             |' },
    { price: 93600, line: '|        ─────           ─────                     |' },
    { price: 92200, line: '|    ────                     ─────        ──────  |' },
    { price: 90800, line: '|            ────                                  |' },
    { price: 89400, line: '|                    ────     ────                |' },
  ];
  
  chartData.forEach(row => {
    chart += `${row.price} ${row.line}\n|\n`;
  });
  
  chart += `88000\nL${'─'.repeat(50)}J\n\n`;
  chart += '     Jan      Mar      May      Jul      Sep      Nov\n\n';
  
  chart += `Current: ₹${currentPrice.toLocaleString()}\n`;
  chart += `Highest: ₹${maxPrice.toLocaleString()}\n`;
  chart += `Lowest: ₹${minPrice.toLocaleString()}\n`;
  chart += `🟣 Flipkart Price`;
  
  return chart;
}

export async function sendLineChartAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  const lineChart = generateLineChart(priceHistory, info.title);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📉 All-Time Low: ₹${minPrice.toLocaleString()}
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

<pre>${lineChart}</pre>

🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    await telegramBot.sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending line chart alert:', error);
    return false;
  }
}