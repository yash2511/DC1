import fs from 'fs';
import { generateSimpleChart } from './simple-chart.js';

// Generate ASCII chart for simple text display
export function generateASCIIChart(priceHistory, title) {
  if (!priceHistory || priceHistory.length < 2) {
    return `📊 ${title}\n\n📈 Insufficient data for chart (need at least 2 price points)`;
  }

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  if (range === 0) {
    return `📊 ${title}\n\n📈 Price stable at ₹${minPrice}`;
  }

  const chartHeight = 8;
  let chart = `📊 ${title}\n\n`;
  
  // Create simple ASCII chart
  for (let i = chartHeight; i >= 0; i--) {
    const threshold = minPrice + (range * i / chartHeight);
    let line = `₹${Math.round(threshold).toString().padStart(6)} |`;
    
    for (const price of prices.slice(-10)) { // Show last 10 points
      if (price >= threshold) {
        line += '█';
      } else {
        line += ' ';
      }
    }
    chart += line + '\n';
  }
  
  chart += '        +' + '-'.repeat(Math.min(prices.length, 10)) + '\n';
  chart += `        Last ${Math.min(prices.length, 10)} price checks\n\n`;
  chart += `📈 Current: ₹${prices[prices.length - 1]}\n`;
  chart += `📉 Lowest: ₹${minPrice}\n`;
  chart += `📊 Highest: ₹${maxPrice}`;
  
  return chart;
}

// Generate date-wise ASCII chart for inline display
export function generateEnhancedASCIIChart(priceHistory, title) {
  return generateSimpleChart(priceHistory, title);
}

// Get price history for a product
export function getPriceHistory(db, productId, limit = 20) {
  return db.priceHistory
    .filter(record => record.productId === productId)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .slice(-limit);
}