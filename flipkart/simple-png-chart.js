import fs from 'fs';

export function generateSimplePngChart(priceHistory, title, productId) {
  if (!priceHistory || priceHistory.length < 2) return null;

  const sortedHistory = priceHistory.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const prices = sortedHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Create a simple PNG using raw bytes (1x1 pixel trick)
  const width = 600;
  const height = 300;
  
  // Generate SVG that can be converted
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="50%" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">${title.substring(0, 40)}</text>
    <polyline points="${prices.map((price, i) => {
      const x = 50 + (i / (prices.length - 1)) * (width - 100);
      const y = 60 + (1 - (price - minPrice) / (maxPrice - minPrice)) * (height - 120);
      return `${x},${y}`;
    }).join(' ')}" fill="none" stroke="red" stroke-width="3"/>
    <text x="50" y="${height - 20}" font-family="Arial" font-size="14">₹${minPrice.toLocaleString()}</text>
    <text x="${width - 100}" y="${height - 20}" font-family="Arial" font-size="14">₹${maxPrice.toLocaleString()}</text>
  </svg>`;

  const filename = `./chart_${productId}_${Date.now()}.svg`;
  fs.writeFileSync(filename, svg);
  return filename;
}