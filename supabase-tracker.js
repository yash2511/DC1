const https = require('https');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

function supabaseQuery(table, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL.replace('https://', ''),
      path: `/rest/v1/${table}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve(JSON.parse(responseData)));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function sendTelegramPhoto(message, chartUrl) {
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    photo: chartUrl,
    caption: message
  });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const req = https.request(options);
  req.write(data);
  req.end();
}

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

function generateChart(priceHistory, productName) {
  const prices = priceHistory.map(p => p.price).join(',');
  const labels = priceHistory.map((p, i) => `Day ${i+1}`).join(',');
  
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels.split(','),
      datasets: [{
        label: 'Price ₹',
        data: prices.split(',').map(Number),
        borderColor: 'rgb(75,192,192)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.1
      }]
    },
    options: {
      title: {
        display: true,
        text: productName + ' Price History'
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  };
  
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
}

async function checkPrices() {
  try {
    // Get products from Supabase
    const products = await supabaseQuery('products?active=eq.true');
    
    for (const product of products) {
      // Simulate price fetch
      const currentPrice = Math.floor(Math.random() * 10000) + 50000;
      
      // Store price in database
      await supabaseQuery('price_history', 'POST', {
        product_id: product.id,
        price: currentPrice,
        date: new Date().toISOString()
      });
      
      // Get price history
      const history = await supabaseQuery(`price_history?product_id=eq.${product.id}&order=date.desc&limit=30`);
      
      // Check if all-time low
      const minPrice = Math.min(...history.map(h => h.price));
      
      if (currentPrice <= minPrice && currentPrice < product.target_price) {
        const chartUrl = generateChart(history.reverse(), product.name);
        
        const message = `🚨 ALL TIME LOW ALERT! 🚨\n\n` +
                       `📱 ${product.name}\n` +
                       `💰 Current: ₹${currentPrice}\n` +
                       `🎯 Target: ₹${product.target_price}\n` +
                       `💸 Save: ₹${product.target_price - currentPrice}\n` +
                       `📊 30-Day Price Chart\n\n` +
                       `🛒 ${product.url}`;
        
        sendTelegramPhoto(message, chartUrl);
        console.log(`Alert with chart sent for ${product.name}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    sendTelegram(`❌ Error checking prices: ${error.message}`);
  }
}

sendTelegram('🚀 Supabase Price Tracker Started!\n\nMonitoring products with price charts...');

setInterval(checkPrices, 10 * 60 * 1000);
setTimeout(checkPrices, 5000);

console.log('Supabase tracker with charts started...');