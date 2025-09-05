import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

let client;
let db;

// Initialize MongoDB connection
export async function initDB() {
  if (!client) {
    // Use MongoDB Atlas free tier or local MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/price-tracker';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('price_tracker');
    
    // Create indexes for better performance
    await db.collection('products').createIndex({ productId: 1 }, { unique: true });
    await db.collection('price_history').createIndex({ productId: 1, recordedAt: -1 });
    
    console.log('✅ Connected to MongoDB');
  }
}

// Add or update product
export async function upsertProduct(productId, title, currentPrice) {
  const products = db.collection('products');
  
  const existing = await products.findOne({ productId });
  
  if (existing) {
    if (currentPrice < existing.lowestPrice) {
      await products.updateOne(
        { productId },
        { 
          $set: { 
            lowestPrice: currentPrice, 
            updatedAt: new Date() 
          } 
        }
      );
      return true; // New all-time low
    }
  } else {
    await products.insertOne({
      productId,
      title,
      lowestPrice: currentPrice,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return true; // First time tracking
  }
  
  return false;
}

// Add price record
export async function addPriceRecord(productId, price) {
  await db.collection('price_history').insertOne({
    productId,
    price,
    recordedAt: new Date()
  });
}

// Get product stats
export async function getProductStats() {
  return await db.collection('products').aggregate([
    {
      $lookup: {
        from: 'price_history',
        localField: 'productId',
        foreignField: 'productId',
        as: 'history'
      }
    },
    {
      $project: {
        title: 1,
        lowest_price: '$lowestPrice',
        record_count: { $size: '$history' },
        last_check: { $max: '$history.recordedAt' }
      }
    },
    { $sort: { last_check: -1 } }
  ]).toArray();
}

// Cleanup old records (keep last 50 per product)
export async function cleanupOldRecords() {
  const pipeline = [
    { $sort: { productId: 1, recordedAt: -1 } },
    {
      $group: {
        _id: '$productId',
        records: { $push: '$$ROOT' }
      }
    },
    {
      $project: {
        toDelete: { $slice: ['$records', 50, { $size: '$records' }] }
      }
    },
    { $unwind: '$toDelete' },
    { $replaceRoot: { newRoot: '$toDelete' } }
  ];
  
  const oldRecords = await db.collection('price_history').aggregate(pipeline).toArray();
  
  if (oldRecords.length > 0) {
    const idsToDelete = oldRecords.map(r => r._id);
    await db.collection('price_history').deleteMany({ _id: { $in: idsToDelete } });
    console.log(`🗑️ Cleaned up ${idsToDelete.length} old records`);
  }
}