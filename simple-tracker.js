const https = require('https');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

// Sample product to track
const PRODUCT = {
  name: 'iPhone 15',
  url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4',
  targetPrice: 70000
};

function sendTelegram(message) {
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const req = https.request(options);
  req.write(data);
  req.end();
}

function checkPrice() {
  // Simulate price check (replace with actual Flipkart API call)
  const currentPrice = Math.floor(Math.random() * 10000) + 65000; // Random price 65k-75k
  
  console.log(`Checking ${PRODUCT.name}: ₹${currentPrice}`);
  
  if (currentPrice < PRODUCT.targetPrice) {
    const message = `🚨 ALL TIME LOW ALERT! 🚨\n\n` +
                   `📱 ${PRODUCT.name}\n` +
                   `💰 Current Price: ₹${currentPrice}\n` +
                   `🎯 Target Price: ₹${PRODUCT.targetPrice}\n` +
                   `💸 You Save: ₹${PRODUCT.targetPrice - currentPrice}\n\n` +
                   `🛒 Buy Now: ${PRODUCT.url}`;
    
    sendTelegram(message);
    console.log('Alert sent!');
  }
}

// Send startup message
sendTelegram('🚀 Flipkart Price Tracker Started!\n\nMonitoring products for price drops...');

// Check prices every 5 minutes
setInterval(checkPrice, 5 * 60 * 1000);

// Initial check
setTimeout(checkPrice, 10000);

console.log('Price tracker started. Checking every 5 minutes...');