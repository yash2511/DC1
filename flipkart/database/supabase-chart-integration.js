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

export async function getPriceStatistics(productId) {
  try {
    // Get price history from Supabase
    const { data: history } = await axios.get(
      `${SUPABASE_URL}/rest/v1/price_history?product_id=eq.${productId}&order=recorded_at.desc&limit=30`,
      { headers }
    );

    if (history.length === 0) return null;

    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[0];
    const reductionPercent = ((maxPrice - currentPrice) / maxPrice * 100).toFixed(1);

    return {
      priceHistory: history.reverse(), // Oldest first for chart
      minPrice,
      maxPrice,
      currentPrice,
      reductionPercent
    };
  } catch (err) {
    console.error('Price stats error:', err.response?.data || err.message);
    return null;
  }
}