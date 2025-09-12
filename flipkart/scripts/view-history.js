import { initDB, getProductStats } from './database.js';

async function viewHistory() {
  try {
    await initDB();
    const stats = await getProductStats();
    
    console.log(`📊 Tracking ${stats.length} products\n`);
    
    stats.forEach(product => {
      console.log(`📱 ${product.title}`);
      console.log(`   Lowest: ₹${product.lowest_price}`);
      console.log(`   Records: ${product.record_count}`);
      console.log(`   Last check: ${product.last_check ? new Date(product.last_check).toLocaleString() : 'Never'}\n`);
    });
    
  } catch (err) {
    console.log('Error:', err.message);
  }
}

viewHistory();