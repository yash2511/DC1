import fs from 'fs';
import { generatePriceChart } from './price-chart-generator.js';

export function generateEnhancedSVGChart(priceHistory, title, productId) {
  return generatePriceChart(priceHistory, title, productId);
}

// Legacy function for backward compatibility
export function generateEnhancedSVGChartLegacy(priceHistory, title, productId) {
  if (!priceHistory || priceHistory.length < 2) {
    return null;
  }

  const prices = priceHistory.map(p => p.price);
  const dates = priceHistory.map(p => new Date(p.recordedAt));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const width = 900;
  const height = 350;
  const padding = 80;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  
  // Calculate points for the price line
  const points = prices.map((price, index) => {
    const x = padding + (index / (prices.length - 1)) * chartWidth;
    const y = padding + (1 - (price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return { x, y, price };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  // Generate month labels for x-axis
  const monthLabels = [];
  const totalMonths = 12;
  for (let i = 0; i < totalMonths; i++) {
    const x = padding + (i / (totalMonths - 1)) * chartWidth;
    const monthNames = ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Jan', 'Mar', 'May'];
    monthLabels.push({ x, label: monthNames[i % monthNames.length] });
  }
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:0.1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#F8FAFC"/>
  
  <!-- Chart background -->
  <rect x="${padding}" y="${padding}" width="${chartWidth}" height="${chartHeight}" fill="white" stroke="none"/>
  
  <!-- Horizontal grid lines -->
  ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const y = padding + ratio * chartHeight;
    return `<line x1="${padding}" x2="${padding + chartWidth}" y1="${y}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>`;
  }).join('')}
  
  <!-- Highest price line -->
  <line x1="${padding}" x2="${padding + chartWidth}" y1="${padding}" y2="${padding}" stroke="#10B981" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="${padding + 10}" y="${padding - 8}" font-family="Arial, sans-serif" font-size="12" fill="#10B981" font-weight="600">Highest ₹${maxPrice.toLocaleString()}</text>
  
  <!-- Current price line -->
  <line x1="${padding}" x2="${padding + chartWidth}" y1="${points[points.length - 1].y}" y2="${points[points.length - 1].y}" stroke="#3B82F6" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="${padding + chartWidth - 120}" y="${points[points.length - 1].y - 8}" font-family="Arial, sans-serif" font-size="12" fill="#3B82F6" font-weight="600">Current Price ₹${currentPrice.toLocaleString()}</text>
  
  <!-- Lowest price line -->
  <line x1="${padding}" x2="${padding + chartWidth}" y1="${padding + chartHeight}" y2="${padding + chartHeight}" stroke="#EF4444" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="${padding + 10}" y="${padding + chartHeight + 20}" font-family="Arial, sans-serif" font-size="12" fill="#EF4444" font-weight="600">Lowest ₹${minPrice.toLocaleString()}</text>
  
  <!-- Price area fill -->
  <path d="${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z" fill="url(#priceGradient)"/>
  
  <!-- Price line -->
  <path d="${pathData}" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Price points -->
  ${points.map(point => 
    `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#8B5CF6" stroke="white" stroke-width="2"/>`
  ).join('')}
  
  <!-- Y-axis price labels -->
  ${[0, 0.5, 1].map(ratio => {
    const y = padding + ratio * chartHeight;
    const price = minPrice + (1 - ratio) * (maxPrice - minPrice);
    return `<text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-family="Arial, sans-serif" font-size="11" fill="#64748B">₹${Math.round(price).toLocaleString()}</text>`;
  }).join('')}
  
  <!-- X-axis month labels -->
  ${monthLabels.map(label => 
    `<text x="${label.x}" y="${padding + chartHeight + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#64748B">${label.label}</text>`
  ).join('')}
  
  <!-- Legend -->
  <circle cx="${width/2 - 50}" cy="${height - 25}" r="4" fill="#8B5CF6"/>
  <text x="${width/2 - 40}" y="${height - 20}" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Flipkart Price</text>
</svg>`;

  const filename = `./chart_${productId}_${Date.now()}.svg`;
  fs.writeFileSync(filename, svg);
  return filename;
}

export async function sendAllTimeLowAlert(product, priceHistory, telegramBot) {
  const info = product.productBaseInfoV1;
  const currentPrice = info.flipkartSpecialPrice.amount;
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  
  // Generate enhanced chart
  const chartFile = generateEnhancedSVGChart(priceHistory, info.title, info.productId);
  
  const message = `🚨 <b>ALL-TIME LOW ALERT!</b> 🚨

📱 <b>${info.title}</b>

💰 Current Price: ₹${currentPrice.toLocaleString()}
🔥 Discount: ${info.discountPercentage}% OFF
📉 All-Time Low: ₹${minPrice.toLocaleString()}
📦 Stock: ${info.inStock ? '✅ Available' : '❌ Out of Stock'}

🛒 <a href="${info.productUrl}">BUY NOW - Limited Time!</a>`;

  try {
    // Send alert message
    await telegramBot.sendMessage(message);
    
    // Send chart if generated
    if (chartFile && fs.existsSync(chartFile)) {
      await telegramBot.sendPhoto(chartFile, `📊 Price History - ${info.title}`);
      fs.unlinkSync(chartFile); // Clean up
    }
    
    return true;
  } catch (error) {
    console.error('Error sending all-time low alert:', error);
    return false;
  }
}