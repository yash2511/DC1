import fs from 'fs';

const DB_FILE = './price-tracker-db.json';

// Initialize database
export async function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: {},
      priceHistory: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Load database
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { products: {}, priceHistory: [] };
  }
}

// Save database
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Add or update product
export async function upsertProduct(productId, title, currentPrice) {
  const db = loadDB();
  
  if (db.products[productId]) {
    // Update if current price is lower
    if (currentPrice < db.products[productId].lowestPrice) {
      db.products[productId].lowestPrice = currentPrice;
      db.products[productId].updatedAt = new Date().toISOString();
      saveDB(db);
      return true; // New all-time low
    }
  } else {
    // Insert new product
    db.products[productId] = {
      title,
      lowestPrice: currentPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveDB(db);
    return true; // First time tracking
  }
  
  return false; // Not a new low
}

// Add price record
export async function addPriceRecord(productId, price) {
  const db = loadDB();
  
  db.priceHistory.push({
    productId,
    price,
    recordedAt: new Date().toISOString()
  });
  
  saveDB(db);
}

// Get product stats
export async function getProductStats() {
  const db = loadDB();
  const stats = [];
  
  Object.entries(db.products).forEach(([id, product]) => {
    const records = db.priceHistory.filter(h => h.productId === id);
    const lastRecord = records[records.length - 1];
    
    stats.push({
      title: product.title,
      lowest_price: product.lowestPrice,
      record_count: records.length,
      last_check: lastRecord?.recordedAt
    });
  });
  
  return stats.sort((a, b) => new Date(b.last_check || 0) - new Date(a.last_check || 0));
}

// Cleanup old records (keep last 30 per product)
export async function cleanupOldRecords() {
  const db = loadDB();
  const productGroups = {};
  
  // Group by product
  db.priceHistory.forEach(record => {
    if (!productGroups[record.productId]) {
      productGroups[record.productId] = [];
    }
    productGroups[record.productId].push(record);
  });
  
  // Keep only last 30 records per product
  db.priceHistory = [];
  Object.values(productGroups).forEach(records => {
    const sorted = records.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
    db.priceHistory.push(...sorted.slice(0, 30));
  });
  
  saveDB(db);
}