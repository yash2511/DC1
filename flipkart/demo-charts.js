import fs from 'fs';
import { generatePriceChart, generateSimplePriceChart } from './price-chart-generator.js';

// Demo script to show price chart functionality with realistic sample data
async function demoCharts() {
  console.log('🎨 Price Chart Demo - Showing Price Reduction Over Time\n');
  
  // Create realistic sample data showing price reduction over 30 days
  const sampleProducts = [
    {
      title: 'iPhone 15 Pro Max (256GB) - Price Drop Alert!',
      productId: 'DEMO001',
      data: [
        { price: 134900, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 132900, recordedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 129900, recordedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 127900, recordedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 124900, recordedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 122900, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 119900, recordedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 117900, recordedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 114900, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 112900, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 109900, recordedAt: new Date().toISOString() }
      ]
    },
    {
      title: 'Samsung Galaxy S24 Ultra (512GB) - Flash Sale!',
      productId: 'DEMO002',
      data: [
        { price: 124999, recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 119999, recordedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 114999, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 109999, recordedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 104999, recordedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 99999, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 94999, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 89999, recordedAt: new Date().toISOString() }
      ]
    },
    {
      title: 'MacBook Air M3 (8GB/256GB) - Limited Time Offer',
      productId: 'DEMO003',
      data: [
        { price: 99900, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 97900, recordedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 94900, recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 91900, recordedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 88900, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 85900, recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 82900, recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { price: 79900, recordedAt: new Date().toISOString() }
      ]
    }
  ];
  
  for (const product of sampleProducts) {
    console.log(`📱 ${product.title}`);
    console.log('─'.repeat(80));
    
    // Generate ASCII chart
    const asciiChart = generateSimplePriceChart(product.data, product.title);
    console.log(asciiChart);
    
    // Generate SVG chart
    try {
      const chartFile = generatePriceChart(product.data, product.title, product.productId);
      
      if (chartFile && fs.existsSync(chartFile)) {
        const stats = fs.statSync(chartFile);
        console.log(`\n✅ SVG Chart Generated: ${chartFile}`);
        console.log(`   📁 File Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   🎨 Chart shows price reduction over time with:`);
        console.log(`      • Date labels on X-axis`);
        console.log(`      • Price values on Y-axis`);
        console.log(`      • Smooth price trend line`);
        console.log(`      • Color-coded price points`);
        console.log(`      • Price statistics box`);
        console.log(`      • Legend for different price points`);
        
        // Keep the chart files for viewing
        console.log(`   💡 Open ${chartFile} in a web browser to view the chart`);
      }
    } catch (error) {
      console.log(`   ❌ Error generating SVG chart: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('🎉 Demo completed!');
  console.log('\n📊 Chart Features:');
  console.log('   • X-axis: Shows dates (Today, Yesterday, Week, Month)');
  console.log('   • Y-axis: Shows price values in ₹');
  console.log('   • Line chart: Smooth curve showing price trend');
  console.log('   • Color coding: Red (first), Green (current), Purple (lowest), Orange (highest)');
  console.log('   • Statistics: Current price, lowest price, total reduction percentage');
  console.log('   • Grid lines: Help read exact values');
  console.log('   • Responsive: Adapts to different time ranges');
  
  console.log('\n🤖 Telegram Bot Commands:');
  console.log('   • "charts" - Get simple ASCII charts');
  console.log('   • "detailed" - Get beautiful SVG charts');
  console.log('   • "start" - Start price monitoring');
  console.log('   • "stop" - Stop price monitoring');
  console.log('   • "status" - Check monitoring status');
}

// Run the demo
demoCharts().catch(console.error);

