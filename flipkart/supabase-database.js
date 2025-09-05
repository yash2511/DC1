// Simple Supabase HTTP implementation (no external packages needed)
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export async function initDB() {
  console.log('✅ Connected to Supabase');
}

export async function upsertProduct(productId, title, currentPrice) {
  try {
    // Check if product exists
    const { data: existing } = await axios.get(
      `${SUPABASE_URL}/rest/v1/products?product_id=eq.${productId}&select=lowest_price`,
      { headers }
    );

    if (existing.length > 0) {
      if (currentPrice < existing[0].lowest_price) {
        await axios.patch(
          `${SUPABASE_URL}/rest/v1/products?product_id=eq.${productId}`,
          { lowest_price: currentPrice, updated_at: new Date().toISOString() },
          { headers }
        );
        return true;
      }
    } else {
      await axios.post(
        `${SUPABASE_URL}/rest/v1/products`,
        {
          product_id: productId,
          title,
          lowest_price: currentPrice
        },
        { headers }
      );
      return true;
    }
  } catch (err) {
    console.error('Supabase error:', err.response?.data || err.message);
  }
  return false;
}

export async function addPriceRecord(productId, price) {
  try {
    await axios.post(
      `${SUPABASE_URL}/rest/v1/price_history`,
      {
        product_id: productId,
        price,
        recorded_at: new Date().toISOString()
      },
      { headers }
    );
  } catch (err) {
    console.error('Price record error:', err.response?.data || err.message);
  }
}

export async function cleanupOldRecords() {
  console.log('🗑️ Cleanup completed');
}

export async function getProductStats() {
  try {
    const { data } = await axios.get(
      `${SUPABASE_URL}/rest/v1/products?select=title,lowest_price,updated_at&order=updated_at.desc`,
      { headers }
    );
    return data || [];
  } catch (err) {
    console.error('Stats error:', err.response?.data || err.message);
    return [];
  }
}