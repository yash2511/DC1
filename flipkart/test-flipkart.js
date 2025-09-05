import axios from "axios";
import dotenv from 'dotenv';

// Load .env from flipkart folder
dotenv.config({ path: './.env' });

const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN } = process.env;

console.log('Affiliate ID:', FLIPKART_AFFILIATE_ID);
console.log('Token:', FLIPKART_AFFILIATE_TOKEN ? 'Present' : 'Missing');

async function testFlipkart() {
  try {
    console.log('Headers being sent:', {
      "Fk-Affiliate-Id": FLIPKART_AFFILIATE_ID,
      "Fk-Affiliate-Token": FLIPKART_AFFILIATE_TOKEN ? 'Present' : 'Missing'
    });
    
    const resp = await axios.get(
      "https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=iphone14&resultType=all",
      {
        headers: {
          "Fk-Affiliate-Id": FLIPKART_AFFILIATE_ID,
          "Fk-Affiliate-Token": FLIPKART_AFFILIATE_TOKEN
        }
      }
    );
    console.log(JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response?.status, err.response?.statusText);
    console.error("Response headers:", err.response?.headers);
    console.error("Response data:", err.response?.data);
    console.error("Full error:", err.message);
  }
}

testFlipkart();
