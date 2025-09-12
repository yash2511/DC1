import { createCanvas } from 'canvas';
import fs from 'fs';

export function generatePngChart(priceHistory, title, productId) {
  if (!priceHistory || priceHistory.length < 2) return null;

  const sortedHistory = priceHistory.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const prices = sortedHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const width = 800;
  const height = 400;
  const padding = { top: 60, right: 80, bottom: 80, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Chart area
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);
  ctx.strokeStyle = '#e9ecef';
  ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);
  
  // Title
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title.length > 50 ? title.substring(0, 50) + '...' : title, width/2, 30);
  
  // Price line
  ctx.beginPath();
  ctx.strokeStyle = '#dc3545';
  ctx.lineWidth = 3;
  
  prices.forEach((price, index) => {
    const x = padding.left + (index / (prices.length - 1)) * chartWidth;
    const y = padding.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // Price labels
  ctx.fillStyle = '#6c757d';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`₹${maxPrice.toLocaleString()}`, padding.left - 10, padding.top + 5);
  ctx.fillText(`₹${minPrice.toLocaleString()}`, padding.left - 10, padding.top + chartHeight + 5);
  
  // Current price
  ctx.fillStyle = '#28a745';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Current: ₹${prices[prices.length-1].toLocaleString()}`, width/2, height - 20);
  
  const filename = `./chart_${productId}_${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  return filename;
}