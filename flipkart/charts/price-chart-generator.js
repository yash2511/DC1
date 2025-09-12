import fs from 'fs';

export function generatePriceChart(priceHistory, title, productId) {
  try {
    const prices = priceHistory.map(p => p.price);
    const dates = priceHistory.map(p => {
      const date = new Date(p.recorded_at);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
    });
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[prices.length - 1];
    const savings = maxPrice - currentPrice;
    
    const width = 900;
    const height = 500;
    const padding = 80;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background gradient
    svg += `<defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#f8f9ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e3f2fd;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
      </linearGradient>
    </defs>`;
    
    svg += `<rect width="${width}" height="${height}" fill="url(#bg)" rx="10"/>`;
    
    // Title
    const shortTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
    svg += `<text x="${width/2}" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#2c3e50">${shortTitle}</text>`;
    
    // Price info box
    svg += `<rect x="20" y="50" width="200" height="100" fill="#fff" stroke="#ddd" rx="8"/>`;
    svg += `<text x="30" y="70" font-size="12" fill="#666">Current Price</text>`;
    svg += `<text x="30" y="90" font-size="20" font-weight="bold" fill="#27ae60">₹${currentPrice.toLocaleString()}</text>`;
    svg += `<text x="30" y="110" font-size="12" fill="#e74c3c">Save ₹${savings.toLocaleString()}</text>`;
    svg += `<text x="30" y="125" font-size="10" fill="#95a5a6">vs Highest ₹${maxPrice.toLocaleString()}</text>`;
    svg += `<text x="30" y="140" font-size="10" fill="#3498db">${new Date().toLocaleDateString()}</text>`;
    
    // Chart area  
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 200;
    const xStep = chartWidth / (prices.length - 1);
    const yRange = maxPrice - minPrice || 1;
    
    // Grid lines
    for (let i = 0; i <= 5; i++) {
      const y = 180 + (i * chartHeight / 5);
      svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
      const gridPrice = maxPrice - (i * yRange / 5);
      svg += `<text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">₹${Math.round(gridPrice).toLocaleString()}</text>`;
    }
    
    // Price line with gradient
    let pathData = '';
    let areaPath = `M ${padding} ${180 + chartHeight}`;
    
    prices.forEach((price, i) => {
      const x = padding + i * xStep;
      const y = 180 + chartHeight - ((price - minPrice) / yRange) * chartHeight;
      pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      areaPath += i === 0 ? ` L ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    areaPath += ` L ${padding + (prices.length - 1) * xStep} ${180 + chartHeight} Z`;
    
    // Area under curve
    svg += `<path d="${areaPath}" fill="url(#lineGrad)" opacity="0.2"/>`;
    
    // Main price line
    svg += `<path d="${pathData}" stroke="url(#lineGrad)" stroke-width="4" fill="none"/>`;
    
    // Price points with hover effect
    prices.forEach((price, i) => {
      const x = padding + i * xStep;
      const y = 180 + chartHeight - ((price - minPrice) / yRange) * chartHeight;
      
      // Highlight lowest price
      const isLowest = price === minPrice;
      const color = isLowest ? '#e74c3c' : '#4ecdc4';
      const radius = isLowest ? 8 : 6;
      
      svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
      
      // Price labels (show only key points)
      if (i === 0 || i === prices.length - 1 || isLowest) {
        svg += `<rect x="${x - 30}" y="${y - 50}" width="60" height="35" fill="#2c3e50" rx="4" opacity="0.9"/>`;
        svg += `<text x="${x}" y="${y - 32}" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">₹${price.toLocaleString()}</text>`;
        svg += `<text x="${x}" y="${y - 20}" text-anchor="middle" font-size="9" fill="#bdc3c7">${dates[i]}</text>`;
      }
      
      // Date labels on X-axis
      if (i % Math.ceil(prices.length / 6) === 0 || i === prices.length - 1) {
        svg += `<text x="${x}" y="${180 + chartHeight + 20}" text-anchor="middle" font-size="10" fill="#666">${dates[i]}</text>`;
      }
    });
    
    // Legend with date info
    svg += `<circle cx="${width - 180}" cy="${height - 60}" r="4" fill="#e74c3c"/>`;
    svg += `<text x="${width - 170}" y="${height - 56}" font-size="12" fill="#666">Lowest Price</text>`;
    svg += `<circle cx="${width - 180}" cy="${height - 40}" r="4" fill="#4ecdc4"/>`;
    svg += `<text x="${width - 170}" y="${height - 36}" font-size="12" fill="#666">Price Trend</text>`;
    svg += `<text x="${width - 180}" y="${height - 20}" font-size="10" fill="#95a5a6">Chart Date: ${new Date().toLocaleDateString()}</text>`;
    svg += `<text x="${width - 180}" y="${height - 8}" font-size="10" fill="#95a5a6">Period: ${dates[0]} to ${dates[dates.length-1]}</text>`;
    
    // Date range info box
    svg += `<rect x="${width - 220}" y="50" width="180" height="60" fill="#f8f9fa" stroke="#ddd" rx="8"/>`;
    svg += `<text x="${width - 210}" y="70" font-size="12" fill="#666" font-weight="bold">Tracking Period</text>`;
    svg += `<text x="${width - 210}" y="85" font-size="10" fill="#666">From: ${dates[0]}</text>`;
    svg += `<text x="${width - 210}" y="98" font-size="10" fill="#666">To: ${dates[dates.length-1]}</text>`;
    
    svg += '</svg>';
    
    const filename = `chart_${productId}_${Date.now()}.svg`;
    fs.writeFileSync(filename, svg);
    return filename;
  } catch (err) {
    console.error('Chart generation error:', err);
    return null;
  }
}