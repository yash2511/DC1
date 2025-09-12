import fs from 'fs';
import { generatePriceChart, generateSimplePriceChart, getPriceHistoryWithDates } from './price-chart-generator.js';

// Test the price chart generation
async function testPriceCharts() {
  console.log('🧪 Testing Price Chart Generation...\n');
  
  // Load the database
  function loadDB() {
    try {
      return JSON.parse(fs.readFileSync('./price-tracker-db.json', 'utf8'));
    } catch {
      return { products: {}, priceHistory: [] };
    }
  }
  
  const db = loadDB();
  const products = Object.entries(db.products);
  
  if (products.length === 0) {
    console.log('❌ No products found in database. Run the price tracker first to collect data.');
    return;
  }
  
  console.log(`📊 Found ${products.length} products in database\n`);
  
  // Test with first few products
  const testProducts = products.slice(0, 3);
  
  for (const [productId, product] of testProducts) {
    console.log(`🔍 Testing chart for: ${product.title}`);
    
    // Get price history for the last 30 days
    const priceHistory = getPriceHistoryWithDates(db, productId, 30);
    
    if (priceHistory.length < 2) {
      console.log(`   ⚠️  Insufficient data (${priceHistory.length} points)\n`);
      continue;
    }
    
    console.log(`   📈 Found ${priceHistory.length} price points`);
    
    // Generate simple ASCII chart
    const asciiChart = generateSimplePriceChart(priceHistory, product.title);
    console.log('\n📊 ASCII Chart:');
    console.log(asciiChart);
    
    // Generate SVG chart
    try {
      const chartFile = generatePriceChart(priceHistory, product.title, productId);
      
      if (chartFile && fs.existsSync(chartFile)) {
        console.log(`\n✅ SVG chart generated: ${chartFile}`);
        
        // Show file size
        const stats = fs.statSync(chartFile);
        console.log(`   📁 File size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Clean up
        fs.unlinkSync(chartFile);
        console.log('   🗑️  Chart file cleaned up');
      } else {
        console.log('   ❌ Failed to generate SVG chart');
      }
    } catch (error) {
      console.log(`   ❌ Error generating SVG chart: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(80) + '\n');
  }
  
  // Test with sample data if no real data
  if (products.length === 0) {
    console.log('🧪 Testing with sample data...\n');
    
    const sampleData = [
      { price: 50000, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 48000, recordedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 45000, recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 42000, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 40000, recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 38000, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { price: 35000, recordedAt: new Date().toISOString() }
    ];
    
    const sampleTitle = 'Samsung Galaxy S24 Ultra (Sample Data)';
    const sampleProductId = 'SAMPLE123';
    
    console.log('📊 ASCII Chart (Sample Data):');
    const asciiChart = generateSimplePriceChart(sampleData, sampleTitle);
    console.log(asciiChart);
    
    try {
      const chartFile = generatePriceChart(sampleData, sampleTitle, sampleProductId);
      
      if (chartFile && fs.existsSync(chartFile)) {
        console.log(`\n✅ Sample SVG chart generated: ${chartFile}`);
        
        const stats = fs.statSync(chartFile);
        console.log(`   📁 File size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Keep the sample chart for viewing
        console.log('   📁 Sample chart saved for viewing');
      }
    } catch (error) {
      console.log(`   ❌ Error generating sample SVG chart: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Price chart testing completed!');
  console.log('\n📱 To test with Telegram bot:');
  console.log('   1. Start the bot: node telegram-bot.js');
  console.log('   2. Send "detailed" command to get SVG charts');
  console.log('   3. Send "charts" command to get ASCII charts');
}

// Run the test
testPriceCharts().catch(console.error);

